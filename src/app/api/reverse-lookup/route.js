import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');

  if (!query) {
    return NextResponse.json({ error: 'IP address is required' }, { status: 400 });
  }

  try {
    // The -x flag in dig is used for reverse DNS lookups
    const { stdout, stderr } = await execPromise(`dig -x ${query}`);
    if (stderr && !stdout) { // dig can sometimes print to stderr for non-errors
      return NextResponse.json({ error: stderr }, { status: 500 });
    }
    return NextResponse.json({ output: stdout || stderr });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}