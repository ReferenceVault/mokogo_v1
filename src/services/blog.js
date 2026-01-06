// Blog service for Strapi integration
const STRAPI_URL = 'http://localhost:1337';

// Get all blog posts - only fetch 4 essential fields
export const getBlogPosts = async (limit = 4) => {
  try {
    return [];
    // const response = await fetch(`${STRAPI_URL}/api/blog-posts?sort=blogpostdate:desc&pagination[limit]=${limit}&populate=featuredImage`);
    
    // if (!response.ok) {
    //   throw new Error(`HTTP error! status: ${response.status}`);
    // }
    
    // const data = await response.json();
    // return data.data || [];
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return [];
  }
};

// Get single blog post by id
export const getBlogPost = async (id) => {
  try {
    console.log('Fetching blog post with id:', id);
    const url = `${STRAPI_URL}/api/blog-posts?filters[id][$eq]=${id}&populate=featuredImage`;
    console.log('API URL:', url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error('Strapi API Error:', {
        status: response.status,
        statusText: response.statusText,
        url: url
      });
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Blog post data received:', data);
    
    // Return the first (and should be only) result
    const blogPost = data.data?.[0] || null;
    console.log('Selected blog post:', blogPost);
    return blogPost;
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return null;
  }
};

// Get all blog posts for blog listing page - only fetch 4 essential fields
export const getAllBlogPosts = async () => {
  try {
    const response = await fetch(`${STRAPI_URL}/api/blog-posts?sort=blogpostdate:desc&populate=featuredImage`);
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching all blog posts:', error);
    return [];
  }
};

// Get blog posts with pagination
export const getBlogPostsPaginated = async (page = 1, limit = 6) => {
  try {
    const start = (page - 1) * limit;
    const response = await fetch(`${STRAPI_URL}/api/blog-posts?sort=blogpostdate:desc&pagination[start]=${start}&pagination[limit]=${limit}&populate=featuredImage`);
    const data = await response.json();
    return {
      data: data.data || [],
      meta: data.meta || { pagination: { total: 0, page: 1, pageSize: limit, pageCount: 0 } }
    };
  } catch (error) {
    console.error('Error fetching paginated blog posts:', error);
    return {
      data: [],
      meta: { pagination: { total: 0, page: 1, pageSize: limit, pageCount: 0 } }
    };
  }
};
