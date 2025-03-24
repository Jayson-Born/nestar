import { Field, InputType } from "@nestjs/graphql";
import { IsNotEmpty, IsOptional, Length } from "class-validator";
import { MemberAuthType, MemberType } from "../../enums/member.enum";
import { ViewGroup } from "../../enums/view.enum";
import { ObjectId } from "mongoose";



@InputType()
export class ViewInput {
    @IsNotEmpty()
    @Length(3, 12)
    @Field(() => String)
    memberId: ObjectId;
    
    @IsNotEmpty()
    @Length(3, 12)
    @Field(() => String)
    viewRefId: ObjectId;
    
    @IsNotEmpty()
    @Length(3, 12)
    @Field(() => ViewGroup)
    viewGroup: ViewGroup;
    
    
  
}
    