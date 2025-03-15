import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { MemberService } from './member.service';
import { InternalServerErrorException } from '@nestjs/common';
import { LoginInput, MemberInput } from '../../libs/dto/member/member.input';
import { Member } from '../../libs/dto/member/member';

@Resolver()
export class MemberResolver {
    constructor(private readonly memberService: MemberService) { }

    @Mutation(() => Member)

    public async signup(@Args('input') input: MemberInput): Promise<Member> {

        console.log('Mutation: signup');
        console.log('input:', input);
        return this.memberService.signup(input);

    }
    @Mutation(() => Member)

    public async login(@Args('input') input: LoginInput): Promise<Member> {

        console.log('Mutation: login');

        return this.memberService.login(input);



    }
    //Authenticated
    @Mutation(() => String)
    public async updateMember(): Promise<string> {
        console.log('Mutation: updateMember')
        return this.memberService.updateMember();
    }
    @Query(() => String)
    public async getMember(): Promise<string> {
        console.log('Mutation: getMember')
        return this.memberService.getMember();
    }

    /** ADMIN **/

    /** Authorization: ADMIN **/
    @Mutation(() => String)
    public async getAllMembersByAdim() : Promise<string>{
        return this.memberService.getAllMembersByAdim();
    }

    /** Authorization: ADMIN **/
    @Mutation(() => String)
    public async getAllMemberByAdim() : Promise<string>{
        console.log('Mutation: getAllMemberByAdim')
        return this.memberService.getAllMemberByAdim();;
    }
}

