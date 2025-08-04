import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');

  if (!query) {
    return NextResponse.json({ error: 'Domain is required' }, { status: 400 });
  }

  try {
    const { stdout, stderr } = await execPromise(`nslookup ${query}`);
    if (stderr) {
      return NextResponse.json({ error: stderr }, { status: 500 });
    }
    return NextResponse.json({ output: stdout });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}