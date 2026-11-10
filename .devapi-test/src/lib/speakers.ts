/** A speaker gets a detail page once their Markdown file has a bio. */
export const hasBio = (body?: string) => !!body && body.replace(/<!--[\s\S]*?-->/g, '').trim().length > 0;
