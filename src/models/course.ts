export interface Course {
	id?: string;
	name: string;
	instructor: string;
	description: string;
	studentCount: number;
	status: 'Đang mở' | 'Đã kết thúc' | 'Tạm dừng';
}
