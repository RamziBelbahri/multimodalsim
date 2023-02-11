import { Papa, ParseConfig, ParseResult } from 'ngx-papaparse';

export function getTime(date: string): number {
	return Date.parse(date);
}

export function papaParse(data: string, config?: ParseConfig): ParseResult {
	const papa = new Papa();
	return papa.parse(data, config);
}
