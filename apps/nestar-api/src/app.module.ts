import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule} from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver } from '@nestjs/apollo';
import { NestarBatchController } from 'apps/nestar-batch/src/nestar-batch.controller';
import { NestarBatchService } from 'apps/nestar-batch/src/nestar-batch.service';
import { AppResolver } from './app.resolver';
import { ComponentsModule } from './components/components.module';
import { DatabaseModule } from './database/database.module';
import { T } from './libs/types/common';

@Module({
 imports: [ConfigModule.forRoot(),
     GraphQLModule.forRoot({
       driver: ApolloDriver,
       playground: true,
       uploads: false,
       autoSchemaFile: true,
       formatError: (error:T) => {
        console.log('error:', error);
        const graphQlFormattedError = {
          code: error?.extensions.code,
          message: error?.extensions?.response?.exception?.message || error?.extensions?.response?.message || error?.message,
        };
        console.log('graphQlFormattedError:', graphQlFormattedError);
        return graphQlFormattedError;
       }
     }),
     ComponentsModule,
     DatabaseModule,
   ],
   controllers: [NestarBatchController, AppController],
   providers: [NestarBatchService, AppResolver, AppService],
})
export class AppModule {}
