# HerbaScan

Progressive Web App (PWA) for plant identification and medicinal-plant learning.

## Features in this build
- Responsive mobile/desktop web app; can be installed as a PWA on supported devices.
- Live camera scan: samples a low-resolution camera frame every 4 seconds; no manual photo capture or gallery cleanup required.
- Camera capture and image upload (up to 5 JPG/PNG images of the same plant).
- Market & cooking helper for selected Mekong Delta dishes (canh chua, canh khoai mỡ, canh khoai môn, lẩu mắm, etc.) with ingredient lookup.
- Real image-identification integration through Pl@ntNet API.
- Ranked candidate species and confidence scores returned by the identification service.
- Starter Vietnamese medicinal-plant learning catalogue (illustrative content; expand with verified monographs).
- API key stays on the server, not in browser JavaScript.

## Run locally
Requires Node.js 20+.

1. Create an account at https://my.plantnet.org/ and generate an API key.
2. Copy `.env.example` to `.env`, then replace the placeholder with your key.
3. Install dependencies: `npm install`
4. Start: `npm start`
5. Open `http://localhost:3000`

The `.env` file must never be committed or shared.

## Deploy
Deploy this folder to a Node.js host (Render, Railway, Fly.io, VPS, etc.) and set `PLANTNET_API_KEY` as a private environment variable. Use HTTPS for camera access on mobile browsers. For a native iOS/Android store app, package the PWA with an appropriate wrapper after testing.

## Live Scan and cooking helper
- Live Scan uses `getUserMedia`, requires camera permission and HTTPS (or localhost), and sends sampled JPEG frames to the same Pl@ntNet identification endpoint. It does not save video or frames on the app server beyond request processing.
- The browser sends at most one frame every 4 seconds and does not send another while a request is pending. This can consume API quota and mobile data.
- The cooking helper is a starter, rule-based ingredient guide, not an AI recipe engine or food-safety certification. Local names such as “khoai ngọt” need clarification; ask the seller and verify the actual tuber.

## Important limitations
- AI identification is a ranked botanical suggestion, not a certified identification and not proof that a plant is medicinal or safe.
- The included catalogue is a small starter dataset, not a complete authoritative pharmacopoeia. Add reviewed records with accepted scientific name, synonyms, Vietnamese/common names, family, diagnostic morphology, part used, chemical constituents, traditional uses, toxicity, contraindications, references, source/license and reviewer.
- Do not make therapeutic claims from image recognition. Confirm identity with a qualified botanist/pharmacognosist and an authenticated specimen before use.
- Pl@ntNet requires a private API key and is subject to its current quota, terms and service availability.

## Mekong Delta priority catalogue (prototype)
The browser catalogue has been expanded to 27 records: the original 9 starter records plus 18 additional plants prioritized from Mekong Delta / Southwest Vietnam references. Examples include rau bợ, choại, rau đắng biển, bí kỳ nam, thiên niên kiện, bình vôi, an xoa, đại bi, muồng trâu and xuyên tâm liên. This is a learning prototype, not a completed regional flora checklist; local occurrence, accepted taxonomy, plant-part use and safety notes still require specialist review and voucher-specimen verification.

Reference leads used for the regional prioritization:
- TS. Đặng Minh Quân, Đại học Cần Thơ, “Danh lục cây thuốc phổ biến ở Đồng bằng sông Cửu Long” (catalogue reference): https://www.scribd.com/document/523315566/DANH-L%E1%BB%A4C-C%C3%82Y-THU%E1%BB%90C-PH%E1%BB%94-BI%E1%BA%BEN-%E1%BB%9E-%C4%90%E1%BB%92NG-B%E1%BA%B0NG-SONG-C%E1%BB%ACU-LONG
- “Đánh giá hiện trạng và tiềm năng phát triển nguồn tài nguyên cây thuốc ... ở một số tỉnh vùng Tây Nam Bộ”, Cục Thông tin, Thống kê (2024): https://vista.gov.vn/vi/news/print/ket-qua-nghien-cuu-trien-khai/danh-gia-hien-trang-va-tiem-nang-phat-trien-nguon-tai-nguyen-cay-thuoc-va-nghien-cuu-bao-ton-trong-trot-mot-so-loai-cay-thuoc-o-mot-so-tinh-vung-tay-nam-bo-9212.html
- Trương Quang Lực et al., “Điều tra nguồn tài nguyên cây thuốc ở các vùng đồi núi thuộc tỉnh An Giang”, Tạp chí Dược liệu 23(1), 2018: https://vienduoclieu.org.vn/an-pham1/Dieu_tra_nguon_tai_nguyen_cay_thuoc_o_cac_vung_doi_nui_thuoc_tinh_An_Giang_Tap_chi_Duoc_lieu_tap_23_so_12018_3198
