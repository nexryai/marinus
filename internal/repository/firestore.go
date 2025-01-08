package repository

import (
	"cloud.google.com/go/firestore"
	"context"
	"errors"
	"fmt"
	"github.com/nexryai/marinus/internal/model"
)

type UserRepository struct {
	client *firestore.Client
}

func NewUserRepository(client *firestore.Client) *UserRepository {
	return &UserRepository{client: client}
}

func (r *UserRepository) getUserRef(ctx context.Context, uid string) *firestore.DocumentRef {
	if uid == "" {
		panic("uid is required")
	}
	return r.client.Collection("users").Doc(uid)
}

func (r *UserRepository) GetUsers(ctx context.Context, lastUserID string, limit int) ([]model.User, error) {
	if limit <= 0 {
		return nil, errors.New("limit must be greater than 0")
	}

	usersRef := r.client.Collection("users")
	query := usersRef.OrderBy(firestore.DocumentID, firestore.Asc).Limit(limit)

	// シーク条件を追加
	if lastUserID != "" {
		query = query.StartAt(lastUserID)
	}

	docs, err := query.Documents(ctx).GetAll()
	if err != nil {
		return nil, fmt.Errorf("failed to get user documents: %w", err)
	}

	users := make([]model.User, 0, len(docs))
	for _, doc := range docs {
		var user model.User
		if err := doc.DataTo(&user); err != nil {
			return nil, fmt.Errorf("failed to convert user document: %w", err)
		}
		users = append(users, user)
	}

	return users, nil
}

// AddTimelineArticle ユーザーのタイムラインに記事を追加
func (r *UserRepository) AddTimelineArticle(ctx context.Context, uid string, article *model.UserTimelineArticle) error {
	userDocRef := r.getUserRef(ctx, uid)
	timelineRef := userDocRef.Collection("timeline")

	// 同一URLの記事が既に存在する場合無視
	query := timelineRef.Where("url", "==", article.Url).Limit(1)
	docs, err := query.Documents(ctx).GetAll()
	if err != nil {
		return fmt.Errorf("failed to check existing article: %w", err)
	}

	if len(docs) > 0 {
		return nil
	}

	_, _, err = timelineRef.Add(ctx, article)
	if err != nil {
		return fmt.Errorf("failed to add timeline article: %w", err)
	}

	return nil
}
