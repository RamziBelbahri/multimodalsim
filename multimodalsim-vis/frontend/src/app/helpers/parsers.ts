import { Papa, ParseConfig, ParseResult, UnparseConfig } from 'ngx-papaparse';
import { UnparseData } from 'ngx-papaparse/lib/interfaces/unparse-data';

export function getTime(date: string | undefined): number {
	return date ? Date.parse(date) : -1 ;
}

export function papaParse(data: string, config?: ParseConfig): ParseResult {
	const papa = new Papa();
	return papa.parse(data, config);
}

export function papaUnparse(data: UnparseData, config?: UnparseConfig): string {
	const papa = new Papa();
	return papa.unparse(data, config);
}
