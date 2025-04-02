import { Module } from '@nestjs/common';
import { MemberResolver } from './member.resolver';
import { MemberService } from './member.service';
import { MongooseModule } from '@nestjs/mongoose';
import MemberSchema from '../../schemas/member.model';
import { AuthModule } from '../auth/auth.module';
import { ViewService } from '../view/view.service';
import { ViewModule } from '../view/view.module';
import { Like } from '../../libs/dto/like/like';
import { LikeModule } from '../like/like.module';

@Module({
  imports: [
    MongooseModule.forFeature([{name: 'Member', schema: MemberSchema}]), AuthModule,
    ViewModule,
    LikeModule
  ],
  providers: [MemberResolver, MemberService],
  exports: [MemberService]
})
export class MemberModule {}
