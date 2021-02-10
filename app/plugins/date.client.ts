import { Context } from '@nuxt/types';
import { Inject } from '@nuxt/types/app';

interface DateParts {
	weekday: string;
	month: string;
	day: string;
	year: string;
	hour: string;
	minute: string;
	second: string;
}

function dateParts(date: Date | string): DateParts {
	if (typeof date === 'string') date = new Date(date);
	const intl = new Intl.DateTimeFormat('en', {
		hour12: false,
		year: 'numeric',
		month: 'long',
		day: 'numeric',
		weekday: 'long',
		hour: 'numeric',
		minute: 'numeric',
		second: 'numeric',
	});
	const parts = intl.formatToParts(date);
	return {
		weekday: parts[0].value,
		month: parts[2].value,
		day: parts[4].value,
		year: parts[6].value,
		hour: parts[8].value,
		minute: parts[10].value,
		second: parts[12].value,
	};
}

export default (_context: Context, inject: Inject) => {
	inject('date', {
		parts: dateParts,
		simpleDate(date: Date | DateParts | string) {
			const parts = typeof date !== 'object' || date instanceof Date ? dateParts(date) : date;
			return `${parts.weekday} ${parts.day} ${parts.month} ${parts.year}`;
		},
		simpleTime(date: Date | DateParts | string) {
			if (typeof date === 'string') date = new Date(date);
			if (date instanceof Date) {
				return `${`00${date.getHours()}`.slice(-2)}:${`00${date.getMinutes()}`.slice(-2)}`;
			}
			return `${`00${date['hour']}`.slice(-2)}:${`00${date['minute']}`.slice(-2)}`;
		},
	});
};
