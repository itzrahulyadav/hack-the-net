import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');

  if (!query) {
    return NextResponse.json({ error: 'Domain name is required' }, { status: 400 });
  }

  // Use 'echo' to automatically close the openssl connection and prevent it from hanging.
  // The -servername flag is important for SNI (Server Name Indication) to get the correct certificate.
  const command = `echo | openssl s_client -connect ${query}:443 -servername ${query} 2>/dev/null`;

  try {
    const { stdout, stderr } = await execPromise(command);

    if (stderr) {
      return NextResponse.json({ error: `Could not fetch certificate for ${query}. It may not have a valid SSL certificate or the domain is incorrect.` }, { status: 500 });
    }
    
    if (!stdout) {
        return NextResponse.json({ output: `No certificate information found for ${query}. This could be because it does not use SSL or there was a connection issue.` });
    }
    
    return NextResponse.json({ output: stdout });
  } catch (error) {
    // This will catch errors if the command itself fails, e.g., cannot resolve host.
    return NextResponse.json({ error: `Failed to connect to ${query}. Please check if the domain is correct and reachable.` }, { status: 500 });
  }
}