import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdministrativesModule } from './components/administratives/administratives.module';
import { AuthModule } from './components/auth/auth.module';
import { StudentsModule } from './components/students/students.module';
import { UserModule } from './components/users/user.module';
import { LoggingInterceptor } from './loging/loging.interceptor';
import { SemestersModule } from './components/semesters/semesters.module';
import { ScholarshipsModule } from './components/scholarships/scholarships.module';
import { WorksModule } from './components/works/works.module';
import { TransactionsModule } from './components/transactions/transactions.module';

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true,
    envFilePath: '.env',
  }), StudentsModule, AdministrativesModule, AuthModule, UserModule, SemestersModule, ScholarshipsModule, WorksModule, TransactionsModule],
  controllers: [AppController],
  providers: [AppService, {
    provide: APP_INTERCEPTOR,
    useClass: LoggingInterceptor,
  },],
})
export class AppModule { }
