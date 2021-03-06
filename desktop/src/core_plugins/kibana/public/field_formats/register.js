import { RegistryFieldFormatsProvider } from 'ui/registry/field_formats';
import { createUrlFormat } from '../../common/field_formats/types/url';
import { createBytesFormat } from '../../common/field_formats/types/bytes';
import { createDateFormat } from '../../common/field_formats/types/date';
import { createRelativeDateFormat } from '../../common/field_formats/types/relative_date';
import { createDurationFormat } from '../../common/field_formats/types/duration';
import { createIpFormat } from '../../common/field_formats/types/ip';
import { createNumberFormat } from '../../common/field_formats/types/number';
import { createDynamicText } from '../../common/field_formats/types/dynamic_text';
import { createPercentFormat } from '../../common/field_formats/types/percent';
import { createStringFormat } from '../../common/field_formats/types/string';
import { createSourceFormat } from '../../common/field_formats/types/source';
import { createColorFormat } from '../../common/field_formats/types/color';
import { createTruncateFormat } from '../../common/field_formats/types/truncate';
import { createBoolFormat } from '../../common/field_formats/types/boolean';
import { createBitsFormat } from '../../common/field_formats/types/bits';
import { createTimeFormat } from '../../common/field_formats/types/time';
import { createCurrencyFormat } from '../../common/field_formats/types/currency';

RegistryFieldFormatsProvider.register(createUrlFormat);
RegistryFieldFormatsProvider.register(createBytesFormat);
RegistryFieldFormatsProvider.register(createDateFormat);
RegistryFieldFormatsProvider.register(createRelativeDateFormat);
RegistryFieldFormatsProvider.register(createDurationFormat);
RegistryFieldFormatsProvider.register(createIpFormat);
RegistryFieldFormatsProvider.register(createNumberFormat);
RegistryFieldFormatsProvider.register(createDynamicText);
RegistryFieldFormatsProvider.register(createPercentFormat);
RegistryFieldFormatsProvider.register(createStringFormat);
RegistryFieldFormatsProvider.register(createSourceFormat);
RegistryFieldFormatsProvider.register(createColorFormat);
RegistryFieldFormatsProvider.register(createTruncateFormat);
RegistryFieldFormatsProvider.register(createBoolFormat);
RegistryFieldFormatsProvider.register(createBitsFormat);
RegistryFieldFormatsProvider.register(createTimeFormat);
RegistryFieldFormatsProvider.register(createCurrencyFormat);
