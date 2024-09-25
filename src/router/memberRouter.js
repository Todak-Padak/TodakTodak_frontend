import MemberCreate from "@/views/member/MemberCreate.vue";
import LoginPage from "@/views/member/LoginPage.vue";


import { jwtDecode } from "jwt-decode";
export const memberRouter = [
    {
        path: '/member/create',
        name: 'MemberCreate',
        component: MemberCreate
    },
    {
        path: '/login',
        name: 'LoginPage',
        component: LoginPage
    },
    {
        path: '/loginSuccess',
        component: LoginPage,
        beforeEnter: (to, from, next) => {
            const accessToken = to.query.token; // 쿼리 파라미터에서 토큰을 가져옴
            // 쿼리 파라미터에서 리프레시 토큰도 가져오려면 아래와 같이 사용합니다.
            const refreshToken = to.query.refreshToken;
    
            if (accessToken) {
                try {
                    // JWT 토큰을 디코딩하여 사용자 정보를 추출합니다.
                    const decoded = jwtDecode(accessToken);
                    // 로컬 스토리지에 토큰과 사용자 정보를 저장합니다.
                    localStorage.setItem("token", accessToken);
                    if (refreshToken) {
                        localStorage.setItem("refreshToken", refreshToken);
                    }
                    localStorage.setItem("memberId", decoded.memberId)
                    localStorage.setItem("email", decoded.sub); // 이메일은 JWT에서 'sub' 클레임으로 보통 저장됩니다.
                    localStorage.setItem("role", decoded.role);
    
                    // 홈 페이지로 리다이렉트합니다.
                    window.location.href = "/";
                } catch (error) {
                    console.error("Invalid token", error);
                    next('/login'); // 토큰이 유효하지 않은 경우 로그인 페이지로 리다이렉트
                }
            } else {
                next('/login'); // 토큰이 없다면 로그인 페이지로 리다이렉트
            }
        }
    }

]