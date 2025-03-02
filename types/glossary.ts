export interface GlossaryTerm {
  id: string;
  term: string;
  aliases: string[];
  full_form?: string;
  short_definition: string;
  long_definition?: string;
  examples?: string[];
  related_terms?: string[];
}
