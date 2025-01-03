package feed

import (
	"errors"
	"github.com/mmcdole/gofeed"
	"github.com/nexryai/archer"
	"github.com/nexryai/marinus/internal/model"
	"net/http"
)

var (
	ErrFeedIsNil = errors.New("feed is nil")
)

type CommonFeedService struct{}

func (c *CommonFeedService) Fetch(url string) (*model.Feed, error) {
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}

	requester := archer.SecureRequest{
		Request:     req,
		TimeoutSecs: 10,
		MaxSize:     1024 * 1024 * 10,
	}

	resp, err := requester.Send()
	if err != nil {
		return nil, err
	}

	parser := gofeed.NewParser()
	feed, err := parser.Parse(resp.Body)
	if err != nil {
		return nil, err
	} else if feed == nil {
		return nil, ErrFeedIsNil
	}

	var imageUrl string
	if feed.Image != nil {
		imageUrl = feed.Image.URL
	} else {
		imageUrl = ""

	}

	res := &model.Feed{
		Title:       feed.Title,
		Description: feed.Description,
		Link:        feed.Link,
		FeedLink:    feed.FeedLink,
		Links:       feed.Links,
		UpdatedAt:   feed.UpdatedParsed,
		PublishedAt: feed.PublishedParsed,
		Authors:     make([]*model.Person, 0),
		Language:    feed.Language,
		ImageUrl:    imageUrl,
		Copyright:   feed.Copyright,
		Items:       make([]*model.Item, 0),
	}

	for _, author := range feed.Authors {
		res.Authors = append(res.Authors, &model.Person{
			Name:  author.Name,
			Email: author.Email,
		})
	}

	for _, item := range feed.Items {
		var imageUrl string

		if item.Image != nil {
			imageUrl = item.Image.URL
		} else {
			imageUrl = ""
		}

		res.Items = append(res.Items, &model.Item{
			Title:       item.Title,
			Description: item.Description,
			Content:     item.Content,
			Link:        item.Link,
			Links:       item.Links,
			UpdatedAt:   item.UpdatedParsed,
			PublishedAt: item.PublishedParsed,
			ImageUrl:    imageUrl,
		})
	}

	return res, nil
}

func NewCommonFeedService() *CommonFeedService {
	return &CommonFeedService{}
}
