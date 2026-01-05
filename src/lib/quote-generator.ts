// Quote of the Day generator using free Hugging Face Inference API
// Generates inspirational journaling quotes that change every 24 hours

interface Quote {
  text: string;
  author: string;
  generatedAt: string;
}

const QUOTE_CACHE_KEY = 'journal-quote-of-the-day';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Get Quote of the Day
 * Returns cached quote if still valid, otherwise generates a new one
 */
export async function getQuoteOfTheDay(): Promise<Quote> {
  // Check cache first
  const cached = getCachedQuote();
  if (cached && !isQuoteExpired(cached)) {
    return cached;
  }

  // Generate new quote
  const newQuote = await generateQuote();
  cacheQuote(newQuote);
  return newQuote;
}

/**
 * Generate a new inspirational quote using Hugging Face
 * Falls back to curated quotes if API fails
 */
async function generateQuote(): Promise<Quote> {
  try {
    // Using Hugging Face's free inference API with a smaller, faster model
    // Alternative models: facebook/opt-350m, google/flan-t5-base, gpt2
    const prompt = `Generate one short inspirational quote about journaling, self-reflection, or personal growth. The quote should be between 10-20 words and be uplifting and meaningful. Format: "Quote text" - Author Name`;

    const response = await fetch(
      'https://api-inference.huggingface.co/models/gpt2',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 50,
            temperature: 0.8,
            top_p: 0.9,
            do_sample: true,
          },
        }),
      }
    );

    if (response.ok) {
      const data = await response.json();
      const generatedText = data[0]?.generated_text || '';

      // Try to parse the generated quote
      const parsed = parseGeneratedQuote(generatedText, prompt);
      if (parsed) {
        return {
          ...parsed,
          generatedAt: new Date().toISOString(),
        };
      }
    }
  } catch (error) {
    console.error('Error generating quote:', error);
  }

  // Fallback to curated quotes
  return getFallbackQuote();
}

/**
 * Parse generated quote text
 */
function parseGeneratedQuote(text: string, originalPrompt: string): { text: string; author: string } | null {
  // Remove the prompt from the response
  let cleaned = text.replace(originalPrompt, '').trim();

  // Try to extract quote and author
  const quoteMatch = cleaned.match(/"([^"]+)"\s*-\s*(.+)/);
  if (quoteMatch) {
    return {
      text: quoteMatch[1].trim(),
      author: quoteMatch[2].trim(),
    };
  }

  // If parsing fails, return null to use fallback
  return null;
}

/**
 * Fallback quotes - curated inspirational quotes about journaling
 */
function getFallbackQuote(): Quote {
  const fallbackQuotes = [
    {
      text: "Writing is the painting of the voice.",
      author: "Voltaire"
    },
    {
      text: "Fill your paper with the breathings of your heart.",
      author: "William Wordsworth"
    },
    {
      text: "Journal writing is a voyage to the interior.",
      author: "Christina Baldwin"
    },
    {
      text: "Writing in a journal reminds you of your goals and of your learning in life.",
      author: "Robin Sharma"
    },
    {
      text: "Keeping a journal will absolutely change your life in ways you've never imagined.",
      author: "Oprah Winfrey"
    },
    {
      text: "The act of writing is the act of discovering what you believe.",
      author: "David Hare"
    },
    {
      text: "Your story matters. Write it down.",
      author: "Unknown"
    },
    {
      text: "The written word is the only anchor we have in life.",
      author: "James Salter"
    },
    {
      text: "A journal is your completely unaltered voice.",
      author: "Lucy Dacus"
    },
    {
      text: "Start writing, no matter what. The water does not flow until the faucet is turned on.",
      author: "Louis L'Amour"
    },
    {
      text: "Peace is found in the pages of your journal.",
      author: "Alexandra Stoddard"
    },
    {
      text: "Journaling helps you to remember how strong you truly are.",
      author: "Unknown"
    },
    {
      text: "Every word you write is a seed planted in your future.",
      author: "Unknown"
    },
    {
      text: "Your journal is a mirror of your soul's journey.",
      author: "Unknown"
    },
    {
      text: "In the silence of the page, your truth emerges.",
      author: "Unknown"
    },
  ];

  // Use date to deterministically select a quote for the day
  const today = new Date().toDateString();
  const seed = hashString(today);
  const index = Math.abs(seed) % fallbackQuotes.length;

  return {
    ...fallbackQuotes[index],
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Simple string hash function for deterministic quote selection
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
}

/**
 * Cache quote in localStorage
 */
function cacheQuote(quote: Quote): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(QUOTE_CACHE_KEY, JSON.stringify(quote));
    } catch (error) {
      console.error('Error caching quote:', error);
    }
  }
}

/**
 * Get cached quote from localStorage
 */
function getCachedQuote(): Quote | null {
  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem(QUOTE_CACHE_KEY);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (error) {
      console.error('Error reading cached quote:', error);
    }
  }
  return null;
}

/**
 * Check if cached quote has expired (older than 24 hours)
 */
function isQuoteExpired(quote: Quote): boolean {
  const age = Date.now() - new Date(quote.generatedAt).getTime();
  return age > CACHE_DURATION;
}
