import { createUrlFormat } from '../../common/field_formats/types/url';
import { createBytesFormat } from '../../common/field_formats/types/bytes';
import { createDateFormat } from '../../common/field_formats/types/date';
import { createDurationFormat } from '../../common/field_formats/types/duration';
import { createIpFormat } from '../../common/field_formats/types/ip';
import { createNumberFormat } from '../../common/field_formats/types/number';
import { createPercentFormat } from '../../common/field_formats/types/percent';
import { createStringFormat } from '../../common/field_formats/types/string';
import { createSourceFormat } from '../../common/field_formats/types/source';
import { createColorFormat } from '../../common/field_formats/types/color';
import { createTruncateFormat } from '../../common/field_formats/types/truncate';
import { createBoolFormat } from '../../common/field_formats/types/boolean';
import { createBitsFormat } from '../../common/field_formats/types/bits';
import { createTimeFormat } from '../../common/field_formats/types/time';
import { createCurrencyFormat } from '../../common/field_formats/types/currency';

export function registerFieldFormats(server) {
  server.registerFieldFormat(createUrlFormat);
  server.registerFieldFormat(createBytesFormat);
  server.registerFieldFormat(createDateFormat);
  server.registerFieldFormat(createDurationFormat);
  server.registerFieldFormat(createIpFormat);
  server.registerFieldFormat(createNumberFormat);
  server.registerFieldFormat(createPercentFormat);
  server.registerFieldFormat(createStringFormat);
  server.registerFieldFormat(createSourceFormat);
  server.registerFieldFormat(createColorFormat);
  server.registerFieldFormat(createTruncateFormat);
  server.registerFieldFormat(createBoolFormat);
  server.registerFieldFormat(createBitsFormat);
  server.registerFieldFormat(createTimeFormat);
  server.registerFieldFormat(createCurrencyFormat);
}
