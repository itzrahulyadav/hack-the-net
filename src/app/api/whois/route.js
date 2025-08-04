import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');

  if (!query) {
    return NextResponse.json({ error: 'IP address or domain is required' }, { status: 400 });
  }

  try {
    const { stdout, stderr } = await execPromise(`whois ${query}`);
    if (stderr) {
      // whois can sometimes return "No match" in stderr
      if (stderr.toLowerCase().includes('no match')) {
        return NextResponse.json({ output: `No WHOIS record found for ${query}` });
      }
      return NextResponse.json({ error: stderr }, { status: 500 });
    }
    return NextResponse.json({ output: stdout });
  } catch (error) {
    // Catch errors for invalid domains, which often exit with a non-zero code
    return NextResponse.json({ output: error.stdout || `Could not fetch WHOIS data for ${query}. It might be an invalid domain.` });
  }
}