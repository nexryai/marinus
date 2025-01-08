package model

import "time"

type UserSubscription struct {
	Url  string `firestore:"url"`
	Name string `firestore:"name"`
}

type User struct {
	Uid           string             `firestore:"uid"`
	Sid           string             `firestore:"sid"`
	Name          string             `firestore:"name"`
	AvatarUrl     string             `firestore:"avatarUrl"`
	Subscriptions []UserSubscription `firestore:"subscriptions"`
}

type UserTimelineArticle struct {
	Index       int        `firestore:"index"`
	Title       string     `firestore:"title"`
	Url         string     `firestore:"url"`
	Content     string     `firestore:"content"`
	ImageUrl    string     `firestore:"imageUrl"`
	Source      string     `firestore:"source"`
	PublishedAt *time.Time `firestore:"publishedAt"`
}
