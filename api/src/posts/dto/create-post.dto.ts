export class CreatePostDto {
	title: string;
	content?: string;
	// authorIdはリクエストボディに不要なため削除
  }