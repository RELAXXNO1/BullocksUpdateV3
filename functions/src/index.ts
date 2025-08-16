import * as functions from 'firebase-functions';
import axios from 'axios';
import * as cheerio from 'cheerio';

export const scrapeProductFromUrl = functions.https.onCall(async (data: functions.https.CallableRequest<{ url: string }>, context) => {
  // Check if the user is authenticated (optional, but good practice for admin functions)
  // if (!context.auth) {
  //   throw new functions.https.HttpsError(
  //     'unauthenticated',
  //     'The function must be called while authenticated.'
  //   );
  // }

  const url = data.data.url;

  if (!url || typeof url !== 'string') {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'The function must be called with a valid "url" argument.'
    );
  }

  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    const $ = cheerio.load(response.data);

    let title = $('meta[property="og:title"]').attr('content') || $('title').text();
    let description = $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content');
    let imageUrl = $('meta[property="og:image"]').attr('content');
    let price = '';

    // Attempt to find price from common schema.org markup or other elements
    // This is a very basic attempt and might need significant refinement for real-world use
    price = $('[itemprop="price"]').attr('content') || $('.product-price').text() || $('.price').text();
    price = price.replace(/[^0-9.]/g, ''); // Basic cleaning

    // Fallback for title if still empty
    if (!title) {
      title = $('h1').first().text().trim();
    }

    // Fallback for description if still empty
    if (!description) {
      description = $('p').first().text().trim();
    }

    return {
      title: title || 'No Title Found',
      description: description || 'No Description Found',
      imageUrl: imageUrl || '',
      price: price || '0', // Return as string, client can parse to number
    };

  } catch (error: any) {
    console.error("Error scraping URL:", error.message);
    throw new functions.https.HttpsError(
      'internal',
      `Failed to scrape product from URL: ${error.message}`
    );
  }
});
