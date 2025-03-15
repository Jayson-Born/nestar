import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Member } from '../../libs/dto/member/member';
import { LoginInput, MemberInput } from '../../libs/dto/member/member.input';
import { MemberStatus } from '../../libs/enums/member.enum';
import { Message } from '../../schemas/common.enums';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class MemberService {

    constructor (@InjectModel('Member') private readonly memberModel: Model<Member>, 
    private authService: AuthService) {}

    public async signup(input : MemberInput): Promise<Member> {
        input.memberPassword= await this.authService.hashPassword(input.memberPassword);
        try{
            const result = await this.memberModel.create(input);
      
            result.accessToken = await this.authService.cretaeToken(result);
            return result;

        }catch (err){
            console.log('Error, Service.model:', err.message);
            throw new InternalServerErrorException(Message.USED_MEMBER_NICK_OR_PHONE);

        }

       
}

public async login(input: LoginInput): Promise<Member> {
    const {memberNick, memberPassword} = input;
    const response: Member = await this.memberModel
    .findOne({memberNick:memberNick})
     .select('+memberPassword')
    .exec() as unknown as Member;

    if(!response || response.memberStatus === MemberStatus.DELETED){
        throw new InternalServerErrorException(Message.NO_MEMBER_NICK);
    } else if( response.memberStatus === MemberStatus.BLOCKED){
        throw new InternalServerErrorException(Message.BLOCKED_USER);
    }

        if (!response.memberPassword) {
            throw new InternalServerErrorException(Message.WRONG_PASSWORD);
        }
        const isMatch = await this.authService.comparePassword(input.memberPassword, response.memberPassword);
        if(!isMatch){
            throw new InternalServerErrorException(Message.WRONG_PASSWORD);


    }

    response.accessToken = await this.authService.cretaeToken(response);
    return response;
}


public async updateMember(): Promise<string> {
    return 'updateMember executed!';
}

public async getMember(): Promise<string> {
    return 'getMember executed!';
}

public async getAllMembersByAdim(): Promise<string> {
    return 'updateMember executed!';
}
public async getAllMemberByAdim(): Promise<string> {
    return 'updateMember executed!';
}


}
