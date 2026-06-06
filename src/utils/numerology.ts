/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Helper to strip Vietnamese diacritics and convert to uppercase standard Latin
export function stripVietnameseDiacritics(str: string): string {
  const map: Record<string, string> = {
    A: "A|À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ",
    E: "E|È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ",
    I: "I|Ì|Í|Ị|Ỉ|Ĩ",
    O: "O|Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ",
    U: "U|Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ",
    Y: "Y|Ỳ|Ý|Y|Ỷ|Ỹ",
    D: "D|Đ",
    B: "B", C: "C", F: "F", G: "G", H: "H", K: "K", L: "L", M: "M",
    N: "N", P: "P", Q: "Q", R: "R", S: "S", T: "T", V: "V", W: "W", X: "X", Z: "Z"
  };

  let upper = str.toUpperCase();
  for (const [latin, pattern] of Object.entries(map)) {
    const regex = new RegExp(pattern, "g");
    upper = upper.replace(regex, latin);
  }
  return upper.replace(/[^A-Z\s]/g, "");
}

// Letter mapping according to the Pythagorean system
const PYTHAGOREAN_CHART: Record<string, number> = {
  A: 1, J: 1, S: 1,
  B: 2, K: 2, T: 2,
  C: 3, L: 3, U: 3,
  D: 4, M: 4, V: 4,
  E: 5, N: 5, W: 5,
  F: 6, O: 6, X: 6,
  G: 7, P: 7, Y: 7,
  H: 8, Q: 8, Z: 8,
  I: 9, R: 9
};

// Vowels & Consonants lists
const VOWELS = ["A", "E", "I", "O", "U", "Y"];

// Sum and reduce digits of a helper
export function sumDigits(num: number): number {
  return String(num)
    .split("")
    .map(Number)
    .reduce((sum, d) => sum + d, 0);
}

// Reduce to single digit (1-9) or master numbers (11, 22, 33)
export function reduceToNumerology(num: number, allowMaster: boolean = true): number {
  let val = num;
  while (val > 9) {
    if (allowMaster && (val === 11 || val === 22 || val === 33)) {
      return val;
    }
    val = sumDigits(val);
  }
  return val;
}

// core calculation function
export interface NumerologyProfile {
  lifePath: number;
  destiny: number;
  soulUrge: number;
  personality: number;
  birthdayNum: number;
  personalYear: number;
}

export function calculateNumerology(dobStr: string, fullName: string): NumerologyProfile {
  // 1. Calculate Life Path (Con số chủ đạo) from Date of Birth (YYYY-MM-DD)
  // DOB Sum
  const dobParts = dobStr.split("-"); // [YYYY, MM, DD]
  const yearStr = dobParts[0] || "2000";
  const monthStr = dobParts[1] || "01";
  const dayStr = dobParts[2] || "01";

  const allDigitsStr = yearStr + monthStr + dayStr;
  const dobDigitsSum = allDigitsStr.split("").map(Number).reduce((s, d) => s + d, 0);
  const lifePath = reduceToNumerology(dobDigitsSum, true);

  // 2. Birthday Number (Chỉ số Ngày sinh)
  const dayVal = Number(dayStr);
  const birthdayNum = reduceToNumerology(dayVal, true);

  // 3. Name numbers
  const cleanedName = stripVietnameseDiacritics(fullName);
  const words = cleanedName.split(/\s+/).filter(Boolean);
  
  let destinySum = 0;
  let soulSum = 0;
  let personalitySum = 0;

  for (const word of words) {
    for (let i = 0; i < word.length; i++) {
      const char = word[i];
      const val = PYTHAGOREAN_CHART[char] || 0;
      destinySum += val;

      if (VOWELS.includes(char)) {
        soulSum += val;
      } else {
        personalitySum += val;
      }
    }
  }

  const destiny = reduceToNumerology(destinySum, true);
  const soulUrge = reduceToNumerology(soulSum, true);
  const personality = reduceToNumerology(personalitySum, true);

  // 4. Personal Year for 2026 (According to current time metadata: 2026)
  const currentYear = 2026;
  const dayMonthSum = dayStr.split("").map(Number).reduce((s, d) => s + d, 0) + 
                     monthStr.split("").map(Number).reduce((s, d) => s + d, 0);
  const personalYear = reduceToNumerology(dayMonthSum + currentYear, false);

  return {
    lifePath,
    destiny,
    soulUrge,
    personality,
    birthdayNum,
    personalYear
  };
}

// Rich Vietnamese definitions for immediate feedback
export interface DescriptionItem {
  title: string;
  keyword: string;
  keyStrengths: string[];
  keyChallenges: string[];
  advice: string;
}

export const LIFE_PATH_DETAILS: Record<number, DescriptionItem> = {
  1: {
    title: "Nhà Lãnh Đạo Tiên Phong (The Leader)",
    keyword: "Độc lập, Độc đáo, Định hướng mục tiêu, Quyết đoán",
    keyStrengths: ["Tinh thần tự chủ cao, không ngại đương đầu thử thách", "Khả năng sáng tạo và khởi xướng ý tưởng mới", "Quyết đoán, thẳng thắn và kiên trì"],
    keyChallenges: ["Dễ trở nên ích kỷ hoặc quá độc đoán", "Thiếu kiên nhẫn khi người khác chậm hơn mình", "Nhạy cảm với lời phê bình"],
    advice: "Học cách lắng nghe ý kiến chung và phát triển lòng bao dung khi làm việc nhóm."
  },
  2: {
    title: "Người Kết Nối & Hòa Giải (The Peacemaker)",
    keyword: "Nhạy cảm, Trực giác, Hòa nhã, Hợp tác",
    keyStrengths: ["Lắng nghe rất tốt và thấu cảm sâu sắc", "Khả năng đàm phán, xoa dịu xung đột", "Yêu hòa bình, coi trọng kết nối gia đình"],
    keyChallenges: ["Dễ bị tổn thương bởi năng lượng tiêu cực", "Thiếu quyết đoán, hay do dự", "Dễ hy sinh quyền lợi bản thân quá mức"],
    advice: "Hãy học cách thiết lập ranh giới cá nhân và dũng cảm nói lên chính kiến."
  },
  3: {
    title: "Người Truyền Cảm Hứng (The Creative Expressionist)",
    keyword: "Hài hước, Sáng tạo, Giao tiếp, Lạc quan",
    keyStrengths: ["Khả năng biểu đạt xuất sắc qua ngôn từ, nghệ thuật", "Luôn tràn đầy năng lượng tích cực, thu hút đám đông", "Sáng tạo vượt trội"],
    keyChallenges: ["Hay bị phân tán mục tiêu, thiếu kiên nhẫn", "Tâm trạng dễ lên xuống thất thường", "Đôi khi nói quá nhiều hoặc thích phán xét"],
    advice: "Tập trung năng lượng vào một mục tiêu cụ thể và rèn luyện tính kỷ luật tự giác."
  },
  4: {
    title: "Nhà Kiến Tạo Kỷ Luật (The Builder/Organizer)",
    keyword: "Thực tế, Trung thực, Kỷ luật, Hệ thống",
    keyStrengths: ["Làm việc có kế hoạch chi tiết, kiên định", "Đáng tin cậy bậc nhất, coi trọng chữ tín", "Tư duy logic, giải quyết vấn đề thực tế giỏi"],
    keyChallenges: ["Bảo thủ, khó chấp nhận sự thay đổi đột ngột", "Quá cứng nhắc hoặc khô khan", "Dễ rơi vào lo âu, làm việc quá sức"],
    advice: "Mở rộng lòng mình để đón nhận các ý tưởng mới và học cách thư giãn đầu óc."
  },
  5: {
    title: "Người Kiến Tạo Tự Do (The Adventurer)",
    keyword: "Tự do, Linh hoạt, Trải nghiệm, Thích khám phá",
    keyStrengths: ["Ứng biến cực nhanh trước mọi hoàn cảnh", "Hào hứng học hỏi, thích du lịch và thay đổi cải tiến", "Sức hút cá nhân cực kỳ lớn"],
    keyChallenges: ["Cực kỳ ghét sự gò bó, dễ cả thèm chóng chán", "Khó cam kết lâu dài trong các dự án", "Xu hướng nuông chiều sở thích quá đà"],
    advice: "Tìm kiếm tự do trong khuôn khổ kỷ luật và tập trung hoàn thành những việc đã bắt đầu."
  },
  6: {
    title: "Người Nuôi Dưỡng & Trách Nhiệm (The Nurturer)",
    keyword: "Yêu thương, Trách nhiệm, Bảo bọc, Nghệ thuật",
    keyStrengths: ["Trái tim nhân hậu, luôn thích chăm sóc người khác", "Gánh vác trách nhiệm gia đình và xã hội xuất sắc", "Có gu thẩm mỹ và yêu nghệ thuật"],
    keyChallenges: ["Dễ can thiệp quá sâu vào cuộc sống của người thân", "Đặt kỳ vọng quá cao và dễ thất vọng", "Hay ôm đồm lo lắng không đáng có"],
    advice: "Gieo yêu thương nhưng cũng cần hiểu rằng mỗi người phải tự đi trên con đường của họ."
  },
  7: {
    title: "Nhà Tri Thức & Chiêm Nghiệm (The Seeker)",
    keyword: "Trí tuệ, Trực giác, Phân tích, Tâm linh",
    keyStrengths: ["Tư duy phân tích cực kỳ sâu sắc, ham học hỏi bản chất", "Trực giác nhạy bén, thích khám phá chân lý độc lập", "Có chiều sâu nội tâm"],
    keyChallenges: ["Khép kín, dễ cô lập bản thân với mọi người", "Hay nghi ngờ và kiểm chứng quá mức", "Xu hướng suy nghĩ quá nhiều dẫn đến tiêu cực"],
    advice: "Hãy bước ra khỏi vỏ bọc, chia sẻ kiến thức của bản thân và tin tưởng cuộc sống nhiều hơn."
  },
  8: {
    title: "Nhà Điều Hành Thành Công (The Achiever)",
    keyword: "Kiên cường, Quyền lực, Thực tế, Quản lý tài chính",
    keyStrengths: ["Năng lực tổ chức, quản lý và điều hành xuất sắc", "Nhạy bén về cơ hội tài chính và vật chất", "Ý chí thép vượt qua khủng hoảng"],
    keyChallenges: ["Dễ bị cuốn vào chủ nghĩa vật chất hoặc độc quyền", "Khó bộc lộ cảm xúc ấm áp một cách tự nhiên", "Căng thẳng từ việc kiểm soát mọi thứ"],
    advice: "Cân bằng giữa đời sống vật chất và sự kết nối tinh thần ngọt ngào với mọi người."
  },
  9: {
    title: "Nhà Nhân Ái & Hoài Bão (The Humanitarian)",
    keyword: "Bao dung, Nhân đạo, Hoài bão lớn, Trách nhiệm xã hội",
    keyStrengths: ["Lý tưởng sống cao đẹp, luôn vì cộng đồng", "Có tầm nhìn bao quát và sức ảnh hưởng tự nhiên", "Rộng lượng, sẵn sàng tha thứ"],
    keyChallenges: ["Dễ sống trong mơ mộng, xa rời thực tế", "Gánh vác áp lực hoặc u uất về quá khứ quá nặng", "Dễ bị người khác lợi dụng lòng tốt"],
    advice: "Xem trọng thực tế, bắt đầu hành động trách nhiệm từ những việc nhỏ bé xung quanh."
  },
  10: {
    title: "Người Thích Nghi & Bản Lĩnh (The Adaptable Pioneer)",
    keyword: "Linh hoạt, Tự chủ, Can đảm, Thích ứng nhanh",
    keyStrengths: ["Khả năng thích ứng vượt trội trong mọi môi trường", "Năng lượng vui tươi, dễ mến và độc lập", "Thích đương đầu khó khăn thách thức"],
    keyChallenges: ["Đôi khi hời hợt trước các vấn đề sâu sắc", "Dễ tự mãn hoặc nóng nảy dẫn đến quyết định vội vàng", "Thiếu sự tĩnh lặng bên trong"],
    advice: "Dành thời gian chiêm nghiệm sâu sắc thay vì chỉ luôn vận động bận rộn bên ngoài."
  },
  11: {
    title: "Người Truyền Đạt Tâm Linh (The Intuitive Messenger)",
    keyword: "Trực giác siêu nhạy, Lý tưởng hóa, Nhạy cảm, Tâm thức",
    keyStrengths: ["Trực giác tinh tế, thấu thị và cảm nhận năng lượng tốt", "Lý tưởng sống cao đẹp, truyền cảm hứng tâm hồn", "Hòa nhã và chân thành"],
    keyChallenges: ["Nhạy cảm quá mức dẫn đến dễ tự ti, u sầu", "Hay lo lắng vẩn vơ, xa rời cuộc sống thực tế", "Dễ mâu thuẫn nội tâm sâu sắc"],
    advice: "Học cách giữ vững năng lượng cá nhân vững vàng thông qua thiền định,yoga hoặc thiên nhiên."
  },
  22: {
    title: "Bậc Thầy Kiến Tạo Thế Giới (The Master Builder)",
    keyword: "Tầm nhìn vĩ đại, Thực tiễn vô song, Quyền lực, Xây dựng hệ thống",
    keyStrengths: ["Kết hợp hoàn hảo giữa tầm nhìn lớn lao của số 11 và kỷ luật vững vàng của số 4", "Khả năng hiện thực hóa các kế hoạch quy mô lớn", "Nhà lãnh đạo tự nhiên"],
    keyChallenges: ["Áp lực tinh thần khổng lồ từ trách nhiệm gánh vác", "Dễ độc đoán cực đoan khi gặp thất bại", "Kỳ vọng hoàn hảo ở cấp độ cực đại"],
    advice: "Từng bước hiện thực hóa mong ước và biết chăm sóc nguồn năng lượng nội tâm của mình."
  },
  33: {
    title: "Bậc Thầy Trị Liệu & Yêu Thương (The Master Teacher)",
    keyword: "Yêu thương vô điều kiện, Trị liệu tâm hồn, Trách nhiệm tối cao, Hy sinh",
    keyStrengths: ["Mang năng lượng chữa lành ngọt ngào ở mức cao nhất", "Sẵn sàng hy sinh cái tôi vì hạnh phúc của nhân loại", "Truyền đạt đạo đức và nghệ thuật tuyệt vời"],
    keyChallenges: ["Dễ bị kiệt quệ năng lượng vì gánh vác việc thiên hạ", "Dễ đau khổ từ sự không hoàn hảo của thế gian", "Khó từ chối người khác"],
    advice: "Chữa lành cho chính mình trước tiên, học cách trao quyền thay vì làm hộ tất cả mọi người."
  }
};

// Map calculated numbers description if any unexpected sum arises
export function getLifePathDetails(num: number): DescriptionItem {
  return LIFE_PATH_DETAILS[num] || {
    title: `Con số chủ đạo đặc biệt ${num}`,
    keyword: "Độc đáo, Phát triển bản thân, Tìm tòi định hướng",
    keyStrengths: ["Năng lượng cá nhân mạnh mẽ", "Tự khám phá con đường riêng"],
    keyChallenges: ["Đôi lúc hoang mang về định hướng", "Cần kiên trì theo đuổi bản chất"],
    advice: "Lắng nghe trực giác và chiêm nghiệm cuộc sống sâu sắc hàng ngày."
  };
}

// Eastern Zodiac Helper for "Tử Vi" aspect
export interface EasternZodiacProfile {
  canChiName: string;
  element: string;
  yinYang: string;
  luckyHours: string;
}

export function calculateEasternZodiac(year: number): EasternZodiacProfile {
  const cans = ["Canh", "Tân", "Nhâm", "Quý", "Giáp", "Ất", "Bính", "Đinh", "Mậu", "Kỷ"];
  // Map index: 1980 % 12 is 0 which is Thân. Let's align array with year % 12
  const chis = ["Thân", "Dậu", "Tuất", "Hợi", "Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi"];
  
  const canIndex = year % 10;
  const chiIndex = year % 12;
  
  const canChiName = `${cans[canIndex]} ${chis[chiIndex]}`;
  
  // Stem element lookup
  const elements = ["Kim", "Kim", "Thủy", "Thủy", "Mộc", "Mộc", "Hỏa", "Hỏa", "Thổ", "Thổ"];
  const element = elements[canIndex] || "Thổ";
  
  const yinYang = (year % 2 === 0) ? "Dương" : "Âm";
  
  // Custom lucky hours per Earthly Branch
  const luckyHourMapping: Record<string, string> = {
    "Tý": "23h - 01h (Giờ Tý), Thân, Thìn",
    "Sửu": "01h - 03h (Giờ Sửu), Tỵ, Dậu",
    "Dần": "03h - 05h (Giờ Dần), Ngọ, Tuất",
    "Mão": "05h - 07h (Giờ Mão), Hợi, Mùi",
    "Thìn": "07h - 09h (Giờ Thìn), Thân, Tý",
    "Tỵ": "09h - 11h (Giờ Tỵ), Sửu, Dậu",
    "Ngọ": "11h - 13h (Giờ Ngọ), Dần, Tuất",
    "Mùi": "13h - 15h (Giờ Mùi), Hợi, Mão",
    "Thân": "15h - 17h (Giờ Thân), Tý, Thìn",
    "Dậu": "17h - 19h (Giờ Dậu), Tỵ, Sửu",
    "Tuất": "19h - 21h (Giờ Tuất), Dần, Ngọ",
    "Hợi": "21h - 23h (Giờ Hợi), Mão, Mùi"
  };
  
  const branchName = chis[chiIndex];
  const luckyHours = luckyHourMapping[branchName] || "N/A";
  
  return {
    canChiName,
    element,
    yinYang,
    luckyHours
  };
}

