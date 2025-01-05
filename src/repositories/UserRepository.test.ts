import { describe, it, expect, afterEach } from "vitest";

import { initializeApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

import { UserRepository } from "@/repositories/UserRepository";

initializeApp({
    projectId: "test",
});

const db = getFirestore();
connectFirestoreEmulator(db, "127.0.0.1", 8080);

const userRepository = new UserRepository(db);

afterEach(async () => {
    // Flush db
    const flushResp = await fetch("http://127.0.0.1:8080/emulator/v1/projects/test/databases/(default)/documents", {
        method: "DELETE",
    });

    if (!flushResp.ok) {
        throw new Error("Failed to flush db");
    }
});

describe("UserRepository - User & profiles", () => {
    it("ユーザーを作成・取得できる", async () => {
        await userRepository.createUser("test", {
            sid: "test",
            name: "test",
            subscriptions: [],
            timeline: [],
        });

        const user = await userRepository.getUserProfile("test");
        expect(user.sid).toBe("test");
        expect(user.name).toBe("test");
    });

    it("uidを指定しないでcreateUserを呼び出した場合エラーを返す", async () => {
        await expect(userRepository.createUser("", {
            sid: "test",
            name: "test",
            subscriptions: [],
            timeline: [],
        })).rejects.toThrowError("Integrity check failed: uid is required");
    });

    it("既に存在するユーザーを作成しようとするとエラーを返す", async () => {
        await userRepository.createUser("test", {
            sid: "test",
            name: "test",
            subscriptions: [],
            timeline: [],
        });

        await expect(userRepository.createUser("test", {
            sid: "test",
            name: "test",
            subscriptions: [],
            timeline: [],
        })).rejects.toThrowError("User already exists");
    });

    it("ユーザーを作成する際にsidがない場合エラーを返す", async () => {
        await expect(
            // @ts-expect-error
            userRepository.createUser("test", {
                name: "test",
                subscriptions: [],
                timeline: [],
            })
        ).rejects.toThrowError("sid is required");
    });

    it("ユーザーを作成する際にnameがない場合デフォルト値を設定する", async () => {
        // @ts-ignore
        await userRepository.createUser("test", {
            sid: "test",
            subscriptions: [],
            timeline: [],
        });

        const user = await userRepository.getUserProfile("test");
        expect(user.name).toBe("New User");
    });

    it("存在しないユーザーの情報を取得しようとした場合エラーを返す", async () => {
        await expect(userRepository.getUserProfile("notfound")).rejects.toThrowError();
    });

    it("uidを指定しないでgetUserProfileを呼び出した場合エラーを返す", async () => {
        await expect(userRepository.getUserProfile("")).rejects.toThrowError("Integrity check failed: uid is required");
    });
});


describe("UserRepository - Subscriptions", () => {
    it("ユーザーにサブスクリプションを追加して取得できる", async () => {
        await userRepository.createUser("test", {
            sid: "test",
            name: "test",
            subscriptions: [],
            timeline: [],
        });

        await userRepository.addSubscription("test", {
            url: "https://example.com",
            name: "test",
        });

        const subscriptions = await userRepository.getSubscriptions("test");
        expect(subscriptions.length).toBe(1);
        expect(subscriptions[0].url).toBe("https://example.com");
        expect(subscriptions[0].name).toBe("test");
    });

    it("ユーザーにサブスクリプションを追加する際にuidがない場合エラーを返す", async () => {
        await expect(userRepository.addSubscription("", {
            url: "test",
            name: "test",
        })).rejects.toThrowError("Integrity check failed: uid is required");
    });

    it("ユーザーにサブスクリプションを追加する際にurlがない場合エラーを返す", async () => {
        // @ts-expect-error
        await expect(userRepository.addSubscription("test", {
            name: "test",
        })).rejects.toThrowError("url is required");
    });

    it("ユーザーにサブスクリプションを追加する際にnameがない場合エラーを返す", async () => {
        // @ts-expect-error
        await expect(userRepository.addSubscription("test", {
            url: "test",
        })).rejects.toThrowError("name is required");
    });

    it("ユーザーにサブスクリプションを追加する際に既に存在するサブスクリプションを追加しようとした場合エラーを返す", async () => {
        await userRepository.createUser("test", {
            sid: "test",
            name: "test",
            subscriptions: [],
            timeline: [],
        });

        await userRepository.addSubscription("test", {
            url: "https://example.com",
            name: "test",
        });

        await expect(userRepository.addSubscription("test", {
            url: "https://example.com",
            name: "test",
        })).rejects.toThrowError("Subscription already exists");
    });

    it("256件以上のサブスクリプションを追加しようとした場合エラーを返す", async () => {
        await userRepository.createUser("test", {
            sid: "test",
            name: "test",
            subscriptions: [],
            timeline: [],
        });

        for (let i = 0; i < 256; i++) {
            await userRepository.addSubscription("test", {
                url: `https://example.com/too/many/subs/${i}`,
                name: `test${i}`,
            });
        }

        await expect(userRepository.addSubscription("test", {
            url: "https://example.com",
            name: "test",
        })).rejects.toThrowError("Maximum number of subscriptions exceeded");
    });
});

describe("UserRepository - Timeline", () => {
    it("ユーザーにタイムラインを追加して取得できる", async () => {
        await userRepository.createUser("test", {
            sid: "test",
            name: "test",
            subscriptions: [],
            timeline: [],
        });

        await userRepository.addTimelineArticle("test", {
            index: 0,
            url: "https://example.com",
            title: "test",
            content: "test",
            imageUrl: "test",
            source: "test",
            publishedAt: new Date(),
        });

        const timeline = await userRepository.getTimeline("test");
        expect(timeline.length).toBe(1);
        expect(timeline[0].url).toBe("https://example.com");
        expect(timeline[0].title).toBe("test");
    });

    it("タイムラインのページネーションが正常に動作する（1ページ目）", async () => {
        await userRepository.createUser("test", {
            sid: "test",
            name: "test",
            subscriptions: [],
            timeline: [],
        });

        for (let i = 0; i < 24; i++) {
            await userRepository.addTimelineArticle("test", {
                index: i,
                url: `https://example.com/${i}`,
                title: `test${i}`,
                content: `test${i}`,
                imageUrl: `test${i}`,
                source: `test${i}`,
                publishedAt: new Date(),
            });
        }

        const timeline = await userRepository.getTimeline("test", 12, 1);
        expect(timeline.length).toBe(12);
        expect(timeline[0].url).toBe("https://example.com/0");
        expect(timeline[11].url).toBe("https://example.com/11");
    });

    it("タイムラインのページネーションが正常に動作する（2ページ目）", async () => {
        await userRepository.createUser("test", {
            sid: "test",
            name: "test",
            subscriptions: [],
            timeline: [],
        });

        for (let i = 0; i < 24; i++) {
            await userRepository.addTimelineArticle("test", {
                index: i,
                url: `https://example.com/${i}`,
                title: `test${i}`,
                content: `test${i}`,
                imageUrl: `test${i}`,
                source: `test${i}`,
                publishedAt: new Date(),
            });
        }

        const timeline = await userRepository.getTimeline("test", 12, 2);
        expect(timeline.length).toBe(12);
        expect(timeline[0].url).toBe("https://example.com/12");
        expect(timeline[11].url).toBe("https://example.com/23");
    });
});
