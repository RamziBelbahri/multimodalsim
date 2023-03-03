import { Papa, ParseConfig, ParseResult } from 'ngx-papaparse';

export function getTime(date: string | undefined): number {
	return date ? Date.parse(date) : -1 ;
}

export function papaParse(data: string, config?: ParseConfig): ParseResult {
	const papa = new Papa();
	return papa.parse(data, config);
}
