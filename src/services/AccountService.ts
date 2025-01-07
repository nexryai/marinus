import { type User } from "@/entities/User";
import { UserRepository } from "@/repositories/UserRepository";

export class AccountService {
    constructor(
        private readonly userRepository: UserRepository
    ) {}

    public async getAccount(uid: string): Promise<User> {
        const fetched = await this.userRepository.getUserProfile(uid);
        if (!fetched) {
            throw new Error("User not found");
        }

        return fetched;
    }
}
