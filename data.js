/* ============================================================
   GIA PHẢ LÊ QUANG — DỮ LIỆU
   Cách sửa: thêm/sửa một dòng người bên dưới.
   Các trường:
     id      : mã duy nhất (không dấu, không khoảng trắng)
     name    : tên chính thức (tên húy)
     alias   : tên gọi khác, ví dụ "Sáu Lý"
     g       : "m" = nam, "f" = nữ
     gen     : đời thứ (số)
     chi     : chi (1..6) — chỉ ghi cho người đứng đầu chi
     parents : [id cha, id mẹ] (có thể bỏ trống)
     spouses : [id vợ/chồng]
     years   : năm sinh–mất (nếu biết)
     phone   : số điện thoại (để trống nếu không có)
     address : địa chỉ
     email   : email
     birth   : năm sinh (chỉ năm)
     death   : năm mất
     place   : quê quán / nơi ở
     job     : nghề nghiệp
     story   : tiểu sử ngắn, chuyện kể
     note    : ghi chú
   Những chỗ ghi "cần xác nhận" trong note là các quan hệ
   suy đoán từ sơ đồ drawio — gia đình nên rà soát lại.
   ============================================================ */
const PEOPLE = [
  // ĐỜI 1–2
  { id:"dai", name:"LÊ QUANG ĐẠI", g:"m", gen:1 },
  { id:"mau", name:"LÊ QUANG MẬU", g:"m", gen:2, parents:["dai"] },
  { id:"ve",  name:"LÊ QUANG VỆ",  g:"m", gen:2, parents:["dai"], spouses:["du"] },

  // ĐỜI 3
  { id:"vanluong", name:"Ông tước VĂN LƯƠNG", g:"m", gen:3, parents:["mau"] },
  { id:"quyt", name:"Ông QUÝT", g:"m", gen:3, parents:["mau"] },
  { id:"locbahau", name:"Ông tước LỘC BÁ HẦU", g:"m", gen:3, parents:["mau"] },
  { id:"so",   name:"Ông SỞ",   g:"m", gen:3, parents:["ve"], spouses:["chuc"] },
  { id:"du",   name:"Bà tổng DỤ", g:"f", gen:3, spouses:["ve"] },
  { id:"chuc", name:"Bà CHỨC", g:"f", gen:3, spouses:["so"] },

  // ĐỜI 4
  { id:"toan",  name:"Ông sinh đồ TOAN", alias:"tên húy VĂN NGHI", g:"m", gen:4, parents:["vanluong"] },
  { id:"y",     name:"Ông Ý",     g:"m", gen:4, parents:["quyt"] },
  { id:"lam",   name:"Ông LÂM",   g:"m", gen:4, parents:["quyt"] },
  { id:"lam2",  name:"Ông LẪM",   g:"m", gen:4, parents:["quyt"] },
  { id:"ni",    name:"Ông NI",    g:"m", gen:4, parents:["so"] },
  { id:"trung", name:"Ông TRUNG", g:"m", gen:4, parents:["so"] },
  { id:"nghi",  name:"Ông NGHỊ",  g:"m", gen:4, parents:["so"] },
  { id:"nghe",   name:"Bà NGHÉ",   g:"f", gen:4, parents:["du"] },
  { id:"trong",  name:"Bà TRONG",  g:"f", gen:4, parents:["chuc"] },
  { id:"nghiem", name:"Bà NGHIÊM", g:"f", gen:4, parents:["chuc"] },
  { id:"thanh",  name:"Bà THANH",  g:"f", gen:4, parents:["chuc"] },

  // ĐỜI 5
  { id:"ky",    name:"Ông KỴ",    g:"m", gen:5, parents:["toan"] },
  { id:"dat",   name:"Ông ĐẠT",   g:"m", gen:5, parents:["toan"] },
  { id:"dien",  name:"Ông ĐIỆN",  g:"m", gen:5, parents:["toan"] },
  { id:"u",     name:"Ông Ừ (ỪA)", alias:"tên húy VĂN PHỐI", g:"m", gen:5, parents:["lam2"] },
  { id:"cuong", name:"Ông CƯƠNG", g:"m", gen:5, parents:["ni"] },
  { id:"tac",   name:"Ông TẮC",   g:"m", gen:5, parents:["trung"] },
  { id:"hao",   name:"Ông HÀO",   g:"m", gen:5, parents:["nghi"], spouses:["ngoa"] },
  { id:"ngoa",  name:"Bà NGÕA",   g:"f", gen:5, spouses:["hao"] },
  { id:"bao",   name:"Bà BẢO",    g:"f", gen:5, spouses:[], note:"Mẹ của LÊ QUANG THƠ; chồng chưa ghi trên sơ đồ." },

  // ĐỜI 6
  { id:"tam",   name:"Ông TÂM",   g:"m", gen:6, parents:["ky"] },
  { id:"trach", name:"Ông TRẠCH", g:"m", gen:6, parents:["dat"] },
  { id:"dien2", name:"Ông DIỄN",  g:"m", gen:6, parents:["dien"] },
  { id:"bai",   name:"Ông BÁI",   g:"m", gen:6, parents:["u"] },
  { id:"luu",   name:"Ông LỮ",    g:"m", gen:6, parents:["u"] },
  { id:"haof",  name:"Bà HẢO",    g:"f", gen:6, parents:["cuong"] },
  { id:"loi",   name:"Bà LỖI",    g:"f", gen:6, parents:["tac"] },
  { id:"kieu",  name:"Bà KIỀU",   g:"f", gen:6, parents:["hao"] },
  { id:"tho6",  name:"LÊ QUANG THƠ", alias:"Ông xã THƯ", g:"m", gen:6, parents:["bao"], spouses:["huong"], note:"Mẹ là Bà BẢO; cha chưa ghi trên sơ đồ." },
  { id:"huong", name:"NGUYỄN THỊ HƯỚNG", g:"f", spouses:["tho6"] },

  // ĐỜI 7 — con của LÊ QUANG THƠ
  { id:"xuan",     name:"LÊ QUANG XUÂN", alias:"trùm QUÁ", g:"m", gen:7, parents:["tho6"] },
  { id:"linhtuan", name:"LÊ QUANG LÍNH TUÂN", g:"m", gen:7, parents:["tho6"] },
  { id:"thung",    name:"LÊ QUANG THUNG", g:"m", gen:7, parents:["tho6"] },
  { id:"trovan",   name:"LÊ QUANG TRÒ VĂN", g:"m", gen:7, parents:["tho6"] },
  { id:"linhtin",  name:"LÊ QUANG LÍNH TÍN", g:"m", gen:7, parents:["tho6"] },
  { id:"chaxa",    name:"LÊ QUANG CHA XẠ", g:"m", gen:7, parents:["tho6"] },
  { id:"tuy",      name:"LÊ QUANG TUY", g:"m", gen:7, parents:["tho6"] },
  { id:"nghiem2",  name:"LÊ QUANG NGHIÊM", g:"m", gen:7, parents:["tho6"] },
  { id:"thuc",  name:"LÊ THỊ THỨC", g:"f", gen:7, parents:["tho6"] },
  { id:"biem",  name:"LÊ THỊ BIỆN", g:"f", gen:7, parents:["tho6"] },
  { id:"diem1", name:"LÊ THỊ ĐIỂM", g:"f", gen:7, parents:["tho6"] },
  { id:"diem2", name:"LÊ THỊ ĐIỀM", g:"f", gen:7, parents:["tho6"] },
  { id:"dung2", name:"LÊ THỊ DUNG", g:"f", gen:7, parents:["tho6"] },
  { id:"thoa",  name:"LÊ THỊ THỎA", g:"f", gen:7, parents:["tho6"] },

  // ĐỜI 8 — con của LÊ QUANG XUÂN
  { id:"qua",   name:"LÊ QUANG QUÁ", alias:"Trưởng Tuyển", g:"m", gen:8, parents:["xuan"] },
  { id:"toan3", name:"LÊ QUANG TOÃN", g:"m", gen:8, parents:["xuan"] },
  { id:"dieu",  name:"LÊ QUANG ĐIỆU", g:"m", gen:8, parents:["xuan"] },
  { id:"vien",  name:"LÊ QUANG VIÊN", g:"m", gen:8, parents:["xuan"] },
  { id:"chau", name:"LÊ THỊ CHÂU", g:"f", gen:8, parents:["xuan"] },
  { id:"tan1", name:"LÊ THỊ TÁN",  g:"f", gen:8, parents:["xuan"] },
  { id:"lam1", name:"LÊ THỊ LÂM",  g:"f", gen:8, parents:["xuan"] },

  // ĐỜI 9 — con của LÊ QUANG QUÁ
  { id:"ngoan", name:"LÊ QUANG NGOAN", alias:"Thông Hương", g:"m", gen:9, parents:["qua"], spouses:["lan"] },
  { id:"lan",   name:"NGUYỄN THỊ LAN", g:"f", spouses:["ngoan"] },
  { id:"quang", name:"LÊ QUANG QUẢNG", g:"m", gen:9, parents:["qua"] },
  { id:"phach", name:"LÊ QUANG PHÁCH", g:"m", gen:9, parents:["qua"] },
  { id:"ta",  name:"LÊ THỊ TẠ",  g:"f", gen:9, parents:["qua"] },
  { id:"lai", name:"LÊ THỊ LẠI", g:"f", gen:9, parents:["qua"] },

  // ĐỜI 10 — con của LÊ QUANG NGOAN
  { id:"tien", name:"LÊ QUANG TIẾN", alias:"Thông Tiến", g:"m", gen:10, parents:["ngoan"] },
  { id:"quy1", name:"LÊ THỊ QUÝ (QUỚI)", g:"f", gen:10, parents:["ngoan"], note:"Con gái hay vợ — cần xác định." },

  // ĐỜI 11 — con của LÊ QUANG TIẾN
  { id:"cau",   name:"LÊ QUANG CÂU (CU)", g:"m", gen:11, parents:["tien"], spouses:["si"] },
  { id:"si",    name:"LÊ THỊ SỈ", g:"f", spouses:["cau"], note:"Cặp đôi cần xác nhận." },
  { id:"vi",    name:"LÊ QUANG VỊ", g:"m", gen:11, parents:["tien"], spouses:["tan2","la"] },
  { id:"tan2",  name:"LÊ THỊ TẤN (TIẾN)", g:"f", spouses:["vi"], note:"Cặp đôi cần xác nhận." },
  { id:"la",    name:"LÊ THỊ LẠ (HÀ)", g:"f", spouses:["vi"] },
  { id:"huop",  name:"LÊ QUANG HƯỢP (HẠT)", g:"m", gen:11, parents:["tien"] },
  { id:"hue",   name:"LÊ QUANG HUỀ", g:"m", gen:11, parents:["tien"] },
  { id:"dau",   name:"LÊ QUANG ĐẤU", g:"m", gen:11, parents:["tien"], spouses:["khanh"] },
  { id:"khanh", name:"LÊ THỊ KHANH", g:"f", spouses:["dau"] },
  { id:"thai",  name:"LÊ QUANG THÁI", g:"m", gen:11, parents:["tien"] },
  { id:"vien2", name:"LÊ QUANG VIỄN", g:"m", gen:11, parents:["tien"] },
  { id:"thong", name:"LÊ QUANG THÔNG", alias:"Quang Minh", g:"m", gen:11, parents:["tien"], chi:1 },
  { id:"buu",   name:"LÊ QUANG BỬU", g:"m", gen:11, parents:["tien"], note:"Chi chưa xác định." },
  { id:"giai",  name:"LÊ QUANG GIAI", g:"m", gen:11, parents:["tien"], chi:2, spouses:["khuong"] },
  { id:"khuong",name:"LÊ THỊ KHƯƠNG", g:"f", spouses:["giai"] },
  { id:"canh",  name:"LÊ QUANG CẢNH", g:"m", gen:11, parents:["tien"], chi:3, spouses:["tiep"] },
  { id:"tiep",  name:"LÊ THỊ TIẾP", g:"f", spouses:["canh"] },
  { id:"toan2", name:"LÊ QUANG TOÀN", g:"m", gen:11, parents:["tien"], chi:5, spouses:["tuong"] },
  { id:"tuong", name:"LÊ THỊ TƯỚNG", g:"f", spouses:["toan2"] },
  { id:"muoi",  name:"LÊ THỊ MƯỜI", g:"f", gen:11, parents:["tien"] },
  { id:"phuoc", name:"LÊ QUANG PHƯỚC", g:"m", gen:11, parents:["tien"], chi:6 },
  { id:"ly",    name:"LÊ QUANG LÝ", alias:"Sáu Lý", g:"m", gen:11, parents:["tien"] },
  { id:"chi",   name:"LÊ QUANG CHỈ", alias:"Bảy Chỉ", g:"m", gen:11, parents:["tien"] },

  // ĐỜI 12 — con của LÊ QUANG THÔNG (CHI 1)
  { id:"dinh",  name:"LÊ QUANG ĐỆ", g:"m", gen:12, parents:["thong"] },
  { id:"huu",   name:"LÊ QUANG HỮU", g:"m", gen:12, parents:["thong"], spouses:["dung3"] },
  { id:"dung3", name:"LÊ THỊ DUNG", g:"f", spouses:["huu"] },
  { id:"tho",   name:"LÊ QUANG THỌ", alias:"Cử nhân Diệu", g:"m", gen:12, parents:["thong"] },
  { id:"huy",   name:"LÊ QUANG HUY", g:"m", gen:12, parents:["thong"] },
  { id:"triet", name:"LÊ QUANG TRIẾT", g:"m", gen:12, parents:["thong"], spouses:["chieu"] },
  { id:"chieu", name:"LÊ THỊ CHIÊU", g:"f", spouses:["triet"] },
  { id:"thinh", name:"LÊ QUANG THỊNH", g:"m", gen:12, parents:["thong"], spouses:["phong"] },
  { id:"phong", name:"LÊ THỊ PHONG", g:"f", spouses:["thinh"], note:"Cặp đôi cần xác nhận." },
  { id:"chien12", name:"LÊ QUANG CHIẾN", g:"m", gen:12, parents:["thong"], chi:4 },
  { id:"nhuan", name:"LÊ QUANG NHUẬN", g:"m", gen:12, parents:["thong"] },

  // ĐỜI 13 — con của LÊ QUANG THỌ
  { id:"chan",    name:"LÊ QUANG CHẤN", g:"m", gen:13, parents:["tho"], spouses:["tho1"] },
  { id:"tho1",    name:"LÊ THỊ THỌ", g:"f", spouses:["chan"] },
  { id:"tienhoc", name:"LÊ QUANG TIÊN (HỌC)", alias:"Học", g:"m", gen:13, parents:["tho"], spouses:["hothisu"], years:"1866–1935" },
  { id:"hothisu", name:"HỒ THỊ SỬ", g:"f", spouses:["tienhoc"], years:"1871–1953" },
  { id:"doi",     name:"LÊ QUANG ĐỐI", g:"m", gen:13, parents:["tho"], spouses:["ky1"] },
  { id:"ky1",     name:"LÊ THỊ KỶ", g:"f", spouses:["doi"], note:"Cặp đôi cần xác nhận." },
  { id:"pho",     name:"LÊ QUANG PHỔ", g:"m", gen:13, parents:["tho"], spouses:["ha1"] },
  { id:"ha1",     name:"LÊ NGỌC HÀ", g:"f", spouses:["pho"], note:"Cặp đôi cần xác nhận." },
  { id:"phieu",   name:"LÊ QUANG PHIẾU", g:"m", gen:13, parents:["tho"], spouses:["chau1"] },
  { id:"chau1",   name:"LÊ NGỌC CHÂU", g:"f", spouses:["phieu"], note:"Cặp đôi cần xác nhận." },
  { id:"te",      name:"LÊ THỊ TẾ", g:"f", gen:13, parents:["tho"], note:"Vợ/chồng chưa xác định." },
  { id:"vodanh",  name:"LÊ vô danh", g:"m", gen:13, parents:["tho"], spouses:["huongcu"] },
  { id:"huongcu", name:"LÊ THỊ HƯỚNG CỬ", g:"f", spouses:["vodanh"] },

  // ĐỜI 14
  { id:"tan",   name:"LÊ QUANG TÁN", g:"m", gen:14, parents:["tienhoc","ky1"], spouses:["toan1"] },
  { id:"toan1", name:"LÊ THỊ TOÀN (TOÀ)", g:"f", spouses:["tan"], note:"Cặp đôi cần xác nhận." },
  { id:"nhi",   name:"LÊ QUANG NHÌ", g:"m", gen:14, parents:["tienhoc","ky1"], spouses:["du2"] },
  { id:"du2",   name:"LÊ NGỌC DỮ", g:"f", spouses:["nhi"], note:"Cặp đôi cần xác nhận." },
  { id:"tam",   name:"LÊ QUANG TAM", g:"m", gen:14, parents:["pho","ha1"], spouses:["luan1"] },
  { id:"luan1", name:"LÊ THỊ LUÂN", g:"f", spouses:["tam"], note:"Cặp đôi cần xác nhận." },
];
