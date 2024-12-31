import { PrismaClient } from "@prisma/client";

export class PrismaService extends PrismaClient {
    async onModuleInit() {
        await this.$connect();
    }
}
