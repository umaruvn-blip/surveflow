import { Link } from 'react-router'
import { ArrowLeft, ShieldCheck, Lock, Eye, Database, RefreshCw, Mail, FileText } from 'lucide-react'

import { Brand } from '@/components/Brand/Brand'
import { Button } from '@/components/ui/button'
import { path } from '@/config/path'

export function PrivacyPolicyPage() {
  const lastUpdated = '06/10/2026'

  return (
    <div className='min-h-screen bg-background text-foreground flex flex-col'>
      {/* Header */}
      <header className='border-b border-border/70 bg-background/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4'>
        <div className='max-w-5xl mx-auto flex items-center justify-between'>
          <Link to={path.home} className='flex items-center gap-2'>
            <Brand />
          </Link>
          <Button variant='outline' size='sm' asChild className='rounded-xl'>
            <Link to={path.home} className='flex items-center gap-2'>
              <ArrowLeft className='size-4' />
              Về trang chủ
            </Link>
          </Button>
        </div>
      </header>

      {/* Hero Banner */}
      <section className='bg-primary/5 border-b border-border/50 py-12 px-6'>
        <div className='max-w-4xl mx-auto space-y-3'>
          <div className='inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold'>
            <ShieldCheck className='size-4' />
            Bảo mật & Quyền riêng tư
          </div>
          <h1 className='text-3xl sm:text-4xl font-black tracking-tight'>
            Chính Sách Quyền Riêng Tư (Privacy Policy)
          </h1>
          <p className='text-muted-foreground text-sm'>
            Cập nhật lần cuối: {lastUpdated} | Áp dụng cho toàn bộ nền tảng SurveyFlow
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className='flex-1 max-w-4xl mx-auto px-6 py-12 space-y-10 leading-relaxed text-sm sm:text-base'>
        {/* Intro */}
        <section className='space-y-4'>
          <p>
            Chào mừng bạn đến với <strong>SurveyFlow</strong>. Chúng tôi coi trọng và cam kết bảo vệ quyền riêng tư, bí mật thông tin của người dùng. Chính sách này giải thích cách chúng tôi thu thập, sử dụng, lưu trữ và bảo vệ dữ liệu cá nhân của bạn khi sử dụng nền tảng SurveyFlow cũng như các dịch vụ tích hợp bên thứ ba (bao gồm Google OAuth, Google Forms API, Google Drive API).
          </p>
        </section>

        {/* 1. Dữ liệu chúng tôi thu thập */}
        <section className='space-y-4 rounded-2xl border bg-card p-6 sm:p-8 shadow-xs'>
          <h2 className='text-xl font-bold flex items-center gap-2 text-primary'>
            <Database className='size-5' />
            1. Thông tin chúng tôi thu thập
          </h2>
          <div className='space-y-3 text-muted-foreground'>
            <p>
              <strong className='text-foreground'>a. Thông tin tài khoản SurveyFlow:</strong> Khi bạn đăng ký hoặc đăng nhập, chúng tôi thu thập tên, địa chỉ email, ảnh đại diện và thông tin hồ sơ cơ bản (năm sinh, giới tính, trường học, nghề nghiệp, sở thích) để cá nhân hóa khảo sát.
            </p>
            <p>
              <strong className='text-foreground'>b. Dữ liệu khi tích hợp Google Forms & Google Drive:</strong> Khi bạn chọn liên kết tài khoản Google để đồng bộ Google Forms:
            </p>
            <ul className='list-disc pl-6 space-y-1.5'>
              <li>Địa chỉ email của tài khoản Google đã liên kết.</li>
              <li>Mã định danh biểu mẫu (Form ID), tiêu đề, mô tả và số lượng câu hỏi từ Google Drive của bạn nhằm hỗ trợ tạo khảo sát nhanh chóng.</li>
              <li>Dữ liệu phản hồi khảo sát (Response timestamps, completion token) để tự động xác minh lượt làm khảo sát hợp lệ.</li>
            </ul>
            <p>
              <strong className='text-foreground'>c. Dữ liệu hoạt động & Lưu lượng (Attribution Data):</strong> Dữ liệu về thiết bị, trình duyệt, địa chỉ IP ẩn danh, nguồn chiến dịch tiếp thị (UTM parameters) nhằm tối ưu trải nghiệm và ngăn ngừa gian lận.
            </p>
          </div>
        </section>

        {/* 2. Tuân thủ chính sách dữ liệu người dùng Google API */}
        <section className='space-y-4 rounded-2xl border border-primary/20 bg-primary/[0.02] p-6 sm:p-8 shadow-xs'>
          <h2 className='text-xl font-bold flex items-center gap-2 text-primary'>
            <Lock className='size-5' />
            2. Tuân thủ Chính sách Dữ liệu Người dùng Google API (Google API Services User Data Policy)
          </h2>
          <div className='space-y-3 text-muted-foreground'>
            <p>
              Việc sử dụng và chuyển giao dữ liệu nhận được từ Google API của SurveyFlow tuân thủ nghiêm ngặt theo{' '}
              <a
                href='https://developers.google.com/terms/api-services-user-data-policy'
                target='_blank'
                rel='noopener noreferrer'
                className='text-primary underline font-semibold'
              >
                Chính sách Dữ liệu Người dùng của Dịch vụ Google API
              </a>
              , bao gồm các yêu cầu về <strong>Sử dụng có giới hạn (Limited Use requirements)</strong>:
            </p>
            <ul className='list-disc pl-6 space-y-2'>
              <li>
                <strong>Không bán dữ liệu:</strong> SurveyFlow tuyệt đối không bán hoặc chuyển nhượng dữ liệu người dùng Google cho bất kỳ bên thứ ba nào vì mục đích quảng cáo hoặc tiếp thị.
              </li>
              <li>
                <strong>Mục đích sử dụng tối thiểu:</strong> Dữ liệu Google Forms và Drive metadata chỉ được sử dụng duy nhất cho mục đích hiển thị danh sách biểu mẫu của chính bạn và xác minh lượt trả lời khảo sát hợp lệ trên nền tảng.
              </li>
              <li>
                <strong>Không dùng huấn luyện AI:</strong> Dữ liệu nhận từ Google API không được sử dụng để huấn luyện các mô hình trí tuệ nhân tạo (AI/ML) tổng quát.
              </li>
            </ul>
          </div>
        </section>

        {/* 3. Cách chúng tôi sử dụng thông tin */}
        <section className='space-y-4 rounded-2xl border bg-card p-6 sm:p-8 shadow-xs'>
          <h2 className='text-xl font-bold flex items-center gap-2 text-primary'>
            <Eye className='size-5' />
            3. Mục đích sử dụng thông tin
          </h2>
          <ul className='list-disc pl-6 space-y-2 text-muted-foreground'>
            <li>Cung cấp, duy trì và cải thiện các chức năng trao đổi khảo sát và tích lũy credits.</li>
            <li>Tự động xác thực các câu trả lời khảo sát thực tế để bảo vệ quyền lợi người tạo khảo sát và người tham gia.</li>
            <li>Phát hiện, ngăn chặn các hành vi gian lận (spam bot, lặp lại lượt trả lời không hợp lệ).</li>
            <li>Thông báo cho bạn về tiến độ khảo sát, giao dịch credits và các cập nhật quan trọng của hệ thống.</li>
          </ul>
        </section>

        {/* 4. Bảo mật và lưu trữ dữ liệu */}
        <section className='space-y-4 rounded-2xl border bg-card p-6 sm:p-8 shadow-xs'>
          <h2 className='text-xl font-bold flex items-center gap-2 text-primary'>
            <RefreshCw className='size-5' />
            4. Bảo mật và Lưu trữ dữ liệu
          </h2>
          <div className='space-y-3 text-muted-foreground'>
            <p>
              Tất cả các Token xác thực (Access Token, Refresh Token) được mã hóa và lưu trữ an toàn trong cơ sở dữ liệu với các biện pháp bảo mật hiện đại. Mọi kết nối truyền tải dữ liệu đều được mã hóa bằng giao thức HTTPS/TLS tiêu chuẩn cao.
            </p>
            <p>
              Chúng tôi chỉ lưu trữ thông tin cần thiết trong khoảng thời gian tài khoản của bạn hoạt động hoặc cho đến khi bạn yêu cầu xóa bỏ.
            </p>
          </div>
        </section>

        {/* 5. Quyền của bạn và Cách hủy liên kết */}
        <section className='space-y-4 rounded-2xl border bg-card p-6 sm:p-8 shadow-xs'>
          <h2 className='text-xl font-bold flex items-center gap-2 text-primary'>
            <FileText className='size-5' />
            5. Quyền của bạn & Quản lý liên kết
          </h2>
          <div className='space-y-3 text-muted-foreground'>
            <p>
              Bạn có toàn quyền kiểm soát dữ liệu của mình trên SurveyFlow:
            </p>
            <ul className='list-disc pl-6 space-y-1.5'>
              <li>
                <strong>Hủy liên kết Google Forms bất kỳ lúc nào:</strong> Bạn có thể nhấn nút &ldquo;Ngắt kết nối&rdquo; ngay tại trang tạo khảo sát. Khi đó, toàn bộ access token và refresh token lưu trên hệ thống sẽ bị xóa hoàn toàn.
              </li>
              <li>
                <strong>Thu hồi quyền từ Google Account:</strong> Bạn cũng có thể thu hồi quyền truy cập của SurveyFlow trực tiếp tại trang{' '}
                <a
                  href='https://myaccount.google.com/permissions'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-primary underline font-semibold'
                >
                  Cài đặt quyền tài khoản Google
                </a>.
              </li>
              <li>
                <strong>Yêu cầu xóa tài khoản & dữ liệu:</strong> Bạn có thể gửi yêu cầu xóa toàn bộ thông tin tài khoản và lịch sử khảo sát thông qua kênh hỗ trợ của chúng tôi.
              </li>
            </ul>
          </div>
        </section>

        {/* 6. Liên hệ */}
        <section className='space-y-4 rounded-2xl border bg-muted/40 p-6 sm:p-8 shadow-xs'>
          <h2 className='text-xl font-bold flex items-center gap-2 text-primary'>
            <Mail className='size-5' />
            6. Thông tin liên hệ
          </h2>
          <p className='text-muted-foreground'>
            Nếu bạn có bất kỳ câu hỏi, thắc mắc hoặc yêu cầu nào liên quan đến Chính sách quyền riêng tư này, vui lòng liên hệ với chúng tôi:
          </p>
          <div className='text-sm space-y-1 font-medium'>
            <p>Đội ngũ phát triển SurveyFlow</p>
            <p>Email: <a href='mailto:support@surveyflow.com' className='text-primary underline'>support@surveyflow.com</a></p>
            <p>Trang web: <a href='https://surveyflow-frontend-six.vercel.app' className='text-primary underline'>https://surveyflow-frontend-six.vercel.app</a></p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className='border-t border-border/70 bg-card py-6 px-6 text-center text-xs text-muted-foreground'>
        <div className='max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4'>
          <p>© 2026 SurveyFlow. Mọi quyền được bảo lưu.</p>
          <div className='flex items-center gap-4'>
            <Link to={path.termsOfService} className='hover:text-foreground transition-colors'>
              Điều khoản dịch vụ
            </Link>
            <span>•</span>
            <Link to={path.privacyPolicy} className='hover:text-foreground font-bold transition-colors'>
              Chính sách quyền riêng tư
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
