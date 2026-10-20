import { Link } from 'react-router'
import { ArrowLeft, FileCheck, CheckCircle2, AlertTriangle, Coins, ShieldAlert, Mail } from 'lucide-react'

import { Brand } from '@/components/Brand/Brand'
import { Button } from '@/components/ui/button'
import { path } from '@/config/path'

export function TermsOfServicePage() {
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
            <FileCheck className='size-4' />
            Điều khoản & Quy định
          </div>
          <h1 className='text-3xl sm:text-4xl font-black tracking-tight'>
            Điều Khoản Dịch Vụ (Terms of Service)
          </h1>
          <p className='text-muted-foreground text-sm'>
            Cập nhật lần cuối: {lastUpdated} | Áp dụng cho tất cả người dùng SurveyFlow
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className='flex-1 max-w-4xl mx-auto px-6 py-12 space-y-10 leading-relaxed text-sm sm:text-base'>
        {/* Intro */}
        <section className='space-y-4'>
          <p>
            Chào mừng bạn đến với <strong>SurveyFlow</strong> — Nền tảng trao đổi và thu thập phản hồi khảo sát học thuật và nghiên cứu. Khi đăng ký tài khoản hoặc sử dụng bất kỳ dịch vụ nào của SurveyFlow, bạn đồng ý tuân thủ các Điều khoản dịch vụ này.
          </p>
        </section>

        {/* 1. Tài khoản người dùng */}
        <section className='space-y-4 rounded-2xl border bg-card p-6 sm:p-8 shadow-xs'>
          <h2 className='text-xl font-bold flex items-center gap-2 text-primary'>
            <CheckCircle2 className='size-5' />
            1. Tài khoản & Trách nhiệm Người dùng
          </h2>
          <div className='space-y-3 text-muted-foreground'>
            <ul className='list-disc pl-6 space-y-2'>
              <li>Bạn phải cung cấp thông tin chính xác, trung thực khi đăng ký tài khoản.</li>
              <li>Bạn có trách nhiệm bảo mật thông tin đăng nhập và mật khẩu tài khoản của mình.</li>
              <li>Mỗi cá nhân chỉ được phép sở hữu và sử dụng 01 tài khoản SurveyFlow chính thức. Các hành vi tạo nhiều tài khoản (clone account) nhằm trục lợi Credits hoặc làm giả phản hồi sẽ bị khóa vĩnh viễn.</li>
            </ul>
          </div>
        </section>

        {/* 2. Quy định tạo và tham gia khảo sát */}
        <section className='space-y-4 rounded-2xl border bg-card p-6 sm:p-8 shadow-xs'>
          <h2 className='text-xl font-bold flex items-center gap-2 text-primary'>
            <ShieldAlert className='size-5' />
            2. Quy định về Khảo sát & Nội dung
          </h2>
          <div className='space-y-3 text-muted-foreground'>
            <p>
              <strong className='text-foreground'>Đối với Người tạo khảo sát (Survey Creators):</strong>
            </p>
            <ul className='list-disc pl-6 space-y-1.5'>
              <li>Nội dung khảo sát phải phục vụ mục đích nghiên cứu, học tập, khảo sát thị trường hợp pháp.</li>
              <li>Nghiêm cấm các khảo sát chứa nội dung lừa đảo (phishing), mã độc, vi phạm pháp luật, xúc phạm danh dự nhân phẩm hoặc thu thập trái phép dữ liệu nhạy cảm (mật khẩu, mã OTP, số thẻ tín dụng).</li>
              <li>Người tạo khảo sát cam kết cung cấp đúng số lượng Credits phần thưởng cho người tham gia sau khi câu trả lời được xác minh hợp lệ.</li>
            </ul>

            <p className='pt-2'>
              <strong className='text-foreground'>Đối với Người tham gia khảo sát (Participants):</strong>
            </p>
            <ul className='list-disc pl-6 space-y-1.5'>
              <li>Người tham gia phải đọc kỹ và trả lời khảo sát một cách nghiêm túc, trung thực.</li>
              <li>Nghiêm cấm việc sử dụng công cụ tự động (bot, script) hoặc điền bừa, gian lận mã hoàn thành để nhận Credits.</li>
            </ul>
          </div>
        </section>

        {/* 3. Cơ chế Credits & Giao dịch */}
        <section className='space-y-4 rounded-2xl border bg-card p-6 sm:p-8 shadow-xs'>
          <h2 className='text-xl font-bold flex items-center gap-2 text-primary'>
            <Coins className='size-5' />
            3. Hệ thống Credits & Phần thưởng
          </h2>
          <div className='space-y-3 text-muted-foreground'>
            <ul className='list-disc pl-6 space-y-2'>
              <li><strong>Credits</strong> là đơn vị điểm thưởng nội bộ được sử dụng trên nền tảng SurveyFlow để đăng tải khảo sát và trao đổi lượt làm khảo sát.</li>
              <li>Credits kiếm được thông qua việc hoàn thành khảo sát hợp lệ hoặc mua gói nạp trên hệ thống.</li>
              <li>SurveyFlow có quyền thu hồi Credits hoặc điều chỉnh số dư nếu phát hiện có gian lận hoặc lỗi hệ thống.</li>
            </ul>
          </div>
        </section>

        {/* 4. Dịch vụ bên thứ ba & Google Forms */}
        <section className='space-y-4 rounded-2xl border bg-card p-6 sm:p-8 shadow-xs'>
          <h2 className='text-xl font-bold flex items-center gap-2 text-primary'>
            <AlertTriangle className='size-5' />
            4. Tích hợp Dịch vụ Bên thứ ba (Google Forms & Drive)
          </h2>
          <div className='space-y-3 text-muted-foreground'>
            <p>
              SurveyFlow hỗ trợ tích hợp với Google Forms API để giúp bạn đồng bộ biểu mẫu và xác minh phản hồi tự động. Bạn thừa nhận rằng:
            </p>
            <ul className='list-disc pl-6 space-y-1.5'>
              <li>Bạn phải tuân thủ Điều khoản dịch vụ của Google khi sử dụng các dịch vụ liên quan.</li>
              <li>SurveyFlow không chịu trách nhiệm đối với các sự cố gián đoạn dịch vụ, thay đổi chính sách từ phía Google hoặc dữ liệu bị mất do người dùng tự thao tác trên Google Drive.</li>
            </ul>
          </div>
        </section>

        {/* 5. Giới hạn trách nhiệm */}
        <section className='space-y-4 rounded-2xl border bg-card p-6 sm:p-8 shadow-xs'>
          <h2 className='text-xl font-bold flex items-center gap-2 text-primary'>
            <ShieldAlert className='size-5' />
            5. Giới hạn Trách nhiệm
          </h2>
          <div className='space-y-3 text-muted-foreground'>
            <p>
              SurveyFlow cung cấp nền tảng theo nguyên tắc &ldquo;nguyên trạng&rdquo; (as-is). Chúng tôi không cam kết hoặc bảo đảm rằng dịch vụ sẽ không bao giờ bị gián đoạn hoặc hoàn toàn không có lỗi, dù chúng tôi luôn nỗ lực tối đa để duy trì tính ổn định và bảo mật cao nhất cho nền tảng.
            </p>
          </div>
        </section>

        {/* 6. Liên hệ */}
        <section className='space-y-4 rounded-2xl border bg-muted/40 p-6 sm:p-8 shadow-xs'>
          <h2 className='text-xl font-bold flex items-center gap-2 text-primary'>
            <Mail className='size-5' />
            6. Thông tin liên hệ
          </h2>
          <p className='text-muted-foreground'>
            Mọi thắc mắc về Điều khoản dịch vụ xin vui lòng liên hệ:
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
            <Link to={path.termsOfService} className='hover:text-foreground font-bold transition-colors'>
              Điều khoản dịch vụ
            </Link>
            <span>•</span>
            <Link to={path.privacyPolicy} className='hover:text-foreground transition-colors'>
              Chính sách quyền riêng tư
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
