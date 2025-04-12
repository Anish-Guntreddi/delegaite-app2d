import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    console.log('Received chat request');
    
    // Get the message from the request body
    const { message } = await request.json();
    console.log('Message received:', message);
    
    if (!message) {
      console.error('No message provided');
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Get the user's session
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    console.log('Session check:', { session: !!session, error: sessionError });
    
    if (sessionError || !session) {
      console.error('Unauthorized:', sessionError);
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Call Deepseek API
    console.log('Calling Deepseek API...');
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'user',
            content: message
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    console.log('Deepseek API response status:', response.status);

    if (!response.ok) {
      const error = await response.json();
      console.error('Deepseek API error:', error);
      return NextResponse.json(
        { error: 'Failed to get response from AI' },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Deepseek API response:', data);
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Invalid Deepseek API response format:', data);
      return NextResponse.json(
        { error: 'Invalid response format from AI' },
        { status: 500 }
      );
    }
    
    // Return the AI's response
    const aiResponse = data.choices[0].message.content;
    console.log('Sending response:', aiResponse);
    
    return NextResponse.json({
      response: aiResponse
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 