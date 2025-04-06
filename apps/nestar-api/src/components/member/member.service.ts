import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Member, Members } from '../../libs/dto/member/member';
import { AgentsInquiry, LoginInput, MemberInput, MembersInquiry } from '../../libs/dto/member/member.input';
import { MemberStatus, MemberType } from '../../libs/enums/member.enum';
import { Direction, Message } from '../../libs/enums/common.enums';
import { AuthService } from '../auth/auth.service';
import { MemberUpdate } from '../../libs/dto/member/member.update';
import { StatisticModifier, T } from '../../libs/types/common';
import { ViewService } from '../view/view.service';
import { ViewGroup } from '../../libs/enums/view.enum';
import { LikeGroup } from '../../libs/enums/like.enum';
import { LikeInput } from '../../libs/dto/like/like.input';
import { LikeService } from '../like/like.service';
import { lookupAuthMemberLiked } from '../../libs/config';


@Injectable()
export class MemberService {

    constructor(@InjectModel('Member') private readonly memberModel: Model<Member>,
        private authService: AuthService,
        private viewService: ViewService,
        private readonly likeService: LikeService    
    ) { }

    public async signup(input: MemberInput): Promise<Member> {
        input.memberPassword = await this.authService.hashPassword(input.memberPassword);
        try {
            const result = await this.memberModel.create(input);

            result.accessToken = await this.authService.createToken(result);
            return result;

        } catch (err) {
            console.log('Error, Service.model:', err.message);
            throw new InternalServerErrorException(Message.USED_MEMBER_NICK_OR_PHONE);

        }


    }

    public async login(input: LoginInput): Promise<Member> {
        const { memberNick, memberPassword } = input;
        const response: Member = await this.memberModel
            .findOne({ memberNick: memberNick })
            .select('+memberPassword')
            .exec() as unknown as Member;

        if (!response || response.memberStatus === MemberStatus.DELETED) {
            throw new InternalServerErrorException(Message.NO_MEMBER_NICK);
        } else if (response.memberStatus === MemberStatus.BLOCKED) {
            throw new InternalServerErrorException(Message.BLOCKED_USER);
        }

        if (!response.memberPassword) {
            throw new InternalServerErrorException(Message.WRONG_PASSWORD);
        }
        const isMatch = await this.authService.comparePassword(input.memberPassword, response.memberPassword);
        if (!isMatch) {
            throw new InternalServerErrorException(Message.WRONG_PASSWORD);


        }

        response.accessToken = await this.authService.createToken(response);
        return response;
    }


    public async updateMember(memberId: ObjectId, input: MemberUpdate): Promise<Member> {
        const result = await this.memberModel.findOneAndUpdate({ _id: memberId, memberStatus: MemberStatus.ACTIVE }, input, { new: true }).exec();
        if (!result) throw new InternalServerErrorException(Message.UPLOAD_FAILED);
        result.accessToken = await this.authService.createToken(result);
        return result;
    }

    public async getMember(memberId: ObjectId | null, targetId: ObjectId): Promise<Member> {
		const search: T = {
			_id: targetId,
			memberStatus: {
				$in: [MemberStatus.ACTIVE, MemberStatus.BLOCKED],
			},
		};

		const targetMember: Member | null = await this.memberModel.findOne(search).lean().exec();
		if (!targetMember) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		if (memberId) {
			const viewInput = {
				viewGroup: ViewGroup.MEMBER,
				viewRefId: targetId,
				memberId: memberId,
			};
			const newView = await this.viewService.recordView(viewInput);
			if (newView) {
				await this.memberModel.findOneAndUpdate(search, { $inc: { memberViews: 1 } }).exec();
				targetMember.memberViews++;
			}
			const likeInput: LikeInput = { memberId: memberId, likeRefId: targetId, likeGroup: LikeGroup.MEMBER };
			targetMember.meLiked = await this.likeService.checkLikeExistence(likeInput);
    
    }
    return targetMember;
}

    public async getAgents(memberId: ObjectId, input: AgentsInquiry): Promise<Members> {
        const { text } = input.search;
        const match: T = { memberType: MemberType.AGENT, memberStatus: MemberStatus.ACTIVE };
        const sort: T = { [input?.sort ?? "createdAt"]: input?.direction ?? Direction.DESC };

        if (text) match.memberNick = { $regex: RegExp(text, 'i') };
        console.log("match:", match)

        const result = await this.memberModel
            .aggregate([
                { $match: match },
                { $sort: sort },
                lookupAuthMemberLiked(memberId),
                {
                    $facet: {
                        list: [{ $skip: (input.page - 1) * input.limit }, { $limit: input.limit }],
                        metaCounter: [{ $count: 'total' }],
                    }
                }
            ])
            .exec();
        console.log('result:', result)
        if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND)
        return result[0]
    }

    public async getAllMembersByAdim(input: MembersInquiry): Promise<Members> {
        const { memberStatus, memberType, text } = input.search;
        const match: T = {};
        const sort: T = { [input?.sort ?? "createdAt"]: input?.direction ?? Direction.DESC };

        if (memberStatus) match.MemberStatus = memberStatus
        if (memberType) match.memberType = memberType

        if (text) match.memberNick = { $regex: RegExp(text, 'i') };
        console.log("match:", match)

        const result = await this.memberModel
            .aggregate([
                { $match: match },
                { $sort: sort },
                {
                    $facet: {
                        list: [{ $skip: (input.page - 1) * input.limit }, { $limit: input.limit }],
                        metaCounter: [{ $count: 'total' }],
                    }
                }
            ])
            .exec();
        console.log('result:', result)
        if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND)
        return result[0]

    }

    public async likeTargetMember(memberId: ObjectId, likeRefId: ObjectId): Promise<Member> {
        const target :Member = await this.memberModel.findOne({ _id: likeRefId, memberStatus: MemberStatus.ACTIVE }).exec() as unknown as Member;
        if (!target) {
            throw new InternalServerErrorException(Message.NO_DATA_FOUND);
        }
        const input: LikeInput ={
            memberId: memberId,
            likeRefId: likeRefId,
            likeGroup: LikeGroup.MEMBER,
        };

        //LIKE TOGGLE via Like modules
        const modifier: number = await this.likeService.toggleLike(input) as unknown as number;
        const result= await this.memberStateEditor({ _id: likeRefId, targetKey: "memberLikes", modifier: modifier});

        if (!result) throw new InternalServerErrorException(Message.SOMETHING_WENT_WRONG);
        return result;
   
    }

    public async getAllMemberByAdim(input: MemberUpdate): Promise<Member> {
        const result = await this.memberModel.findOneAndUpdate({ _id: input._id }, input, { new: true }).exec();
        if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);
        return result
    }

    public async memberStateEditor(input: StatisticModifier): Promise<Member> {
        console.log('executed memberStateEditor');
        const { _id, targetKey, modifier } = input;
        return (await this.memberModel
            .findOneAndUpdate({ _id }, { $inc: { [targetKey]: modifier } }, { new: true })
            .exec()) as unknown as Member;
    }

}
