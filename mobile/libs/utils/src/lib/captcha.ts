import { vuHttp } from '@vu/http';

export const Captcha = vuHttp.get$<CaptchaRefresh>('/captcha/refresh/');

export interface CaptchaRefresh {
  audio_url?: string;
  image_url: string;
  key: string;
}
