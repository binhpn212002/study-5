import { BullModule } from "@nestjs/bull";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { BackgroundModule } from "./background/background.module";
import { JwtAuthGuard } from "./common/guards/jwt-auth.guard";
import appConfig from "./config/app.config";
import databaseConfig from "./config/database.config";
import firebaseConfig from "./config/firebase.config";
import internalConfig from "./config/internal.config";
import jwtConfig from "./config/jwt.config";
import lowStockAlertConfig from "./config/low-stock-alert.config";
import redisConfig from "./config/redis.config";
import { AuthModule } from "./modules/auth/auth.module";
import { FirebaseAdminService } from "./modules/auth/services/firebase-admin.service";
import { SentenceModule } from "./modules/sentence/sentence.module";
import { UserVocabModule } from "./modules/user-vocab/user-vocab.module";
import { UserModule } from "./modules/user/user.module";
import { VocabularyModule } from "./modules/vocabulary/vocabulary.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        appConfig,
        databaseConfig,
        redisConfig,
        jwtConfig,
        firebaseConfig,
        internalConfig,
        lowStockAlertConfig,
      ],
      envFilePath: [".env.local", ".env"],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const env = configService.get<string>("app.env");
        return {
          type: "postgres",
          host: configService.get<string>("database.host"),
          port: configService.get<number>("database.port"),
          username: configService.get<string>("database.username"),
          password: configService.get<string>("database.password"),
          database: configService.get<string>("database.database"),
          autoLoadEntities: true,
          synchronize: env === "development",
          logging: env === "development",
        };
      },
    }),

    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const redisConfig = {
          host: configService.get<string>("redis.host"),
          port: configService.get<number>("redis.port"),
        };
        return { redis: redisConfig };
      },
    }),
    UserModule,
    AuthModule,
    VocabularyModule,
    SentenceModule,
    UserVocabModule,
    BackgroundModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    FirebaseAdminService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
})
export class AppModule {}
