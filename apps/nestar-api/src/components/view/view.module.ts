import { Module } from '@nestjs/common';
import { ViewService } from './view.service';
import { MongooseModule } from '@nestjs/mongoose';
import ViewSchema from '../../schemas/View.model';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [ MongooseModule.forFeature([{name: 'View', schema: ViewSchema}]), 
  AuthModule,
  ViewModule
  ],
  providers: [ViewService],
  exports: [ViewService],
})
export class ViewModule {}
