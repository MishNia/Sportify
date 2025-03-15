package docs

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

// **Test SwaggerInfo Initialization**
func TestSwaggerInfoInitialization(t *testing.T) {
	assert.NotNil(t, SwaggerInfo, "SwaggerInfo should not be nil")
	assert.Equal(t, "Sportify", SwaggerInfo.Title, "Title should be Sportify")
	assert.Equal(t, "/v1", SwaggerInfo.BasePath, "BasePath should be /v1")
	assert.Equal(t, "API for sportify, a social network for sports enthusiasts.", SwaggerInfo.Description, "Description should match")
}

// **Test Swagger Template Formatting**
func TestSwaggerTemplate(t *testing.T) {
	assert.NotEmpty(t, SwaggerInfo.SwaggerTemplate, "Swagger template should not be empty")
	assert.Contains(t, SwaggerInfo.SwaggerTemplate, `"swagger": "2.0"`, "Swagger template should contain Swagger version")
}
