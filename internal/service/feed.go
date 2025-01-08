package service

import (
	"context"
	"github.com/nexryai/marinus/internal/feed"
	"github.com/nexryai/marinus/internal/model"
	"github.com/nexryai/marinus/internal/repository"
	"time"
)

type FeedUpdateService struct {
	FeedService    *feed.CommonFeedService
	UserRepository *repository.UserRepository
}

func (s *FeedUpdateService) updateUserFeed(ctx context.Context, user *model.User) error {
	for _, subscription := range user.Subscriptions {
		articles, err := s.FeedService.Fetch(subscription.Url)
		if err != nil {
			return err
		}

		// Add articles to user's timeline
		for _, article := range articles.Items {
			dbArticle := model.UserTimelineArticle{
				Title:       article.Title,
				Content:     article.Content,
				PublishedAt: article.PublishedAt,
				ImageUrl:    article.ImageUrl,
				Source:      subscription.Name,
			}

			if err := s.UserRepository.AddTimelineArticle(ctx, user.Uid, &dbArticle); err != nil {
				return err
			}
		}
	}

	return nil
}

func (s *FeedUpdateService) UpdateAllUsersFeeds() error {
	ctx := context.Background()
	lastUserId := ""
	for {
		users, err := s.UserRepository.GetUsers(ctx, lastUserId, 20)
		if err != nil {
			return err
		}

		if len(users) == 0 {
			break
		}

		for _, user := range users {
			if err := s.updateUserFeed(ctx, &user); err != nil {
				return err
			}
		}

		lastUserId = users[len(users)-1].Uid

		// Cooldown
		time.Sleep(5 * time.Second)
	}

	return nil
}
