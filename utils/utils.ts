export function slugify(text:string):string{
    return text
    .toString() // Convert to string
    .normalize('NFD') // Decompose accented characters
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .toLowerCase() // Convert to lowercase
    .trim() // Trim whitespace from both ends
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/[^\w-]+/g, '') // Remove non-word characters
    .replace(/--+/g, '-'); // Replace multiple hyphens with a single hyphen
}