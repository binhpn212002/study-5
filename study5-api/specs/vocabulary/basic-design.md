Basic Design - Vocabulary Module

1. Mục tiêu

Module Vocabulary cho phép:

Quản lý từ vựng tiếng Trung theo cấp độ HSK.
Học từ vựng theo level.
Tìm kiếm từ vựng.
Hiển thị pinyin, nghĩa tiếng Việt.
Hiển thị câu ví dụ.
Hỗ trợ flashcard sau này.

2. Actors
   Admin
   Thêm từ vựng
   Sửa từ vựng
   Xóa từ vựng
   Xem danh sách từ vựng
   Student
   Xem danh sách từ vựng
   Tìm kiếm từ vựng
   Xem chi tiết từ vựng
   Học theo HSK 3. Vocabulary Entity
   Vocabulary
   enum HskLevel {
   HSK1 = 'HSK1',
   HSK2 = 'HSK2',
   HSK3 = 'HSK3',
   HSK4 = 'HSK4',
   HSK5 = 'HSK5',
   HSK6 = 'HSK6',
   }
   Vocabulary
   Field Type Description
   id uuid PK
   chinese string Từ tiếng Trung
   pinyin string Phiên âm
   vietnameseMeaning string Nghĩa tiếng Việt
   exampleSentence text Câu ví dụ
   exampleMeaning text Nghĩa câu ví dụ
   level HskLevel Cấp độ HSK
   createdAt datetime Ngày tạo
   updatedAt datetime Ngày cập nhật
