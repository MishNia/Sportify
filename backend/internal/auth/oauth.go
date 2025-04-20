package auth

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"

	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
)

var (
	googleOauthConfig *oauth2.Config
	ErrInvalidCode   = errors.New("invalid code")
)

// GoogleUserInfoFunc is a function type for getting Google user info
type GoogleUserInfoFunc func(code string) (*GoogleUserInfo, error)

// GetGoogleUserInfo is a variable that holds the function to get Google user info
var GetGoogleUserInfo GoogleUserInfoFunc = getGoogleUserInfo

func init() {
	googleOauthConfig = &oauth2.Config{
		ClientID:     "your client id here",
		ClientSecret: "your client secret here",
		RedirectURL:  "http://localhost:8080/v1/auth/google/callback",
		Scopes: []string{
			"https://www.googleapis.com/auth/userinfo.email",
			"https://www.googleapis.com/auth/userinfo.profile",
		},
		Endpoint: google.Endpoint,
	}
}

type GoogleUserInfo struct {
	ID            string `json:"id"`
	Email         string `json:"email"`
	VerifiedEmail bool   `json:"verified_email"`
	Name          string `json:"name"`
	GivenName     string `json:"given_name"`
	FamilyName    string `json:"family_name"`
	Picture       string `json:"picture"`
}

func GetGoogleAuthURL() string {
	return googleOauthConfig.AuthCodeURL("state")
}

// getGoogleUserInfo is the actual implementation of getting Google user info
func getGoogleUserInfo(code string) (*GoogleUserInfo, error) {
	if code == "" {
		return nil, ErrInvalidCode
	}

	ctx := context.Background()
	token, err := googleOauthConfig.Exchange(ctx, code)
	if err != nil {
		return nil, fmt.Errorf("failed to exchange token: %v", err)
	}

	client := googleOauthConfig.Client(ctx, token)
	resp, err := client.Get("https://www.googleapis.com/oauth2/v2/userinfo")
	if err != nil {
		return nil, fmt.Errorf("failed to get user info: %v", err)
	}
	defer resp.Body.Close()

	var userInfo GoogleUserInfo
	if err := json.NewDecoder(resp.Body).Decode(&userInfo); err != nil {
		return nil, fmt.Errorf("failed to decode user info: %v", err)
	}

	return &userInfo, nil
}
