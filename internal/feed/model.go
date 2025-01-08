package feed

import "time"

type Person struct {
	Name  string `json:"name,omitempty"`
	Email string `json:"email,omitempty"`
}

type Item struct {
	Title       string     `json:"title,omitempty"`
	Description string     `json:"description,omitempty"`
	Content     string     `json:"content,omitempty"`
	Link        string     `json:"link,omitempty"`
	Links       []string   `json:"links,omitempty"`
	UpdatedAt   *time.Time `json:"updatedAt,omitempty"`
	PublishedAt *time.Time `json:"publishedAt,omitempty"`
	ImageUrl    string     `json:"image,omitempty"`
}

type Feed struct {
	Title       string     `json:"title,omitempty"`
	Description string     `json:"description,omitempty"`
	Link        string     `json:"link,omitempty"`
	FeedLink    string     `json:"feedLink,omitempty"`
	Links       []string   `json:"links,omitempty"`
	UpdatedAt   *time.Time `json:"updatedAt,omitempty"`
	PublishedAt *time.Time `json:"publishedAt,omitempty"`
	Authors     []*Person  `json:"authors,omitempty"`
	Language    string     `json:"language,omitempty"`
	ImageUrl    string     `json:"image,omitempty"`
	Copyright   string     `json:"copyright,omitempty"`
	Items       []*Item    `json:"items"`
}
