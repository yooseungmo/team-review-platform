# team-review-platform

NestJS + MongoDB 기반 게임 이벤트/리뷰 관리 플랫폼
MSA(3개 서비스: Gateway / Auth / Game-Event) 구조로 구현

---
## 주요 기능
> Gateway Server: 모든 API 진입점, JWT 인증, RBAC 권한 검사, 요청 프록시  
> Auth Server: 사용자 등록/로그인, 역할(Role)/팀(Team) 관리, JWT 발급/로그아웃/연장  
> Game-Event Server: 이벤트 CRUD, 리뷰 상태머신, 최종 승인 상태 계산, 리뷰 히스토리, 리뷰어 재지정
>
> 각 모듈은 단일 책임 원칙(SRP)에 따라 분리했으며, Auth와 Game-Event 간의 결합도를 낮추기 위해 JWT 기반 인증을 채택했습니다. Gateway는 공통 진입점으로 RBAC 정책을 중앙화했습니다.
---

## 기술 스택 (Tech Stack)

| 분야                | 상세 내용                                             |
| ------------------- | ----------------------------------------------------- |
| **Framework**       | NestJS                                                |
| **Node.js**        | 20 (LTS)                                            |
| **Database**        | MongoDB (mongoose)              |
| **인증/인가**       | JWT, RBAC(Role-Based Access Control) 적용                             |
| **배포/실행**     | Docker, Docker Compose                               |
| **언어** | TypeScript                             |
| **Code Style**        | Airbnb Style Guide + ESLint + Prettier                                  |


---



## 설치 및 실행 (Installation & Usage)

### 1. Repository Clone
```
git clone https://github.com/yooseungmo/team-review-platform.git
cd team-review-platform

읽기 전용 토큰: 메일로 제출
```
### 2. env 생성
```
평가 편의를 위해 실제 제출물에는 .env를 포함했습니다.(프라이빗 레포)
운영 전환 시 제거/Secret Manager 이관 권장.
```
### 3. Docker Compose 실행
```
docker-compose up --build
```
각 서비스는 아래 포트로 기동됩니다:
> Gateway: 3000    
> Auth   : 3001   
> Game-Event : 3002      

---

### Swagger API 문서
| 서비스 | URL | 설명 |
|--------|-----|------|
| **Gateway** | http://localhost:3000/docs# | 통합 API 문서 (권장) |
| **Auth** | http://localhost:3001/docs# | Auth 서비스 문서 |
| **Game-Event** | http://localhost:3002/docs# | Event 서비스 문서 |

> **권장:** Gateway 문서(3000)에서 통합 테스트 (JWT/RBAC 적용 흐름 그대로 확인 가능)
---
### 역할·팀 규칙 (과제 준수)
```
ADMIN / VIEWER → team = null (고정)
PLANNER → team = PM (고정)
REVIEWER → team ∈ {PM, DEV, QA, CS} (필수)
```
| Role | 가능한 API 범위 | Team |
|------|----------------|------|
| **ADMIN** | 전체 접근 가능 | - |
| **PLANNER** | 본인 생성 이벤트 CRUD | PM |
| **REVIEWER** | 배정된 리뷰만 수정 | PM/DEV/QA/CS |
| **VIEWER** | 비민감 정보 조회만 | - |
---
## 👥 테스트 계정

**모든 계정의 초기 비밀번호는 `123456` 입니다.**  
컨테이너 기동 시 `seed-auth` 잡이 자동 생성합니다.

| 역할 | 이메일 | 팀 | 비밀번호 |
|------|--------|-----|----------|
| **ADMIN** | admin@nexon.com | - | 123456 |
| **PLANNER** | planner@nexon.com | PM | 123456 |
| **REVIEWER** | reviewer-dev@nexon.com | DEV | 123456 |
| **REVIEWER** | reviewer-qa@nexon.com | QA | 123456 |
| **REVIEWER** | reviewer-cs@nexon.com | CS | 123456 |
| **REVIEWER** | reviewer-pm@nexon.com | PM | 123456 |
| **VIEWER** | viewer@nexon.com | - | 123456 |

### 재시드가 필요하면:

```bash
docker compose run --rm seed-auth
```

---
## API 목록
아래 경로는 **Gateway(3000)** 기준입니다.  
(Auth/Game-Event 서비스의 Swagger도 개별 확인 가능)

### Auth

```
POST   /auth/register     # 사용자 등록 (Public, 역할/팀 규칙 자동 정규화)
POST   /auth/login        # 로그인 (Public) → access/refresh 발급
POST   /auth/logout       # 로그아웃 (Access Token 기반)
POST   /auth/refresh      # 로그인 연장 (유효한 Refresh → Access만 재발급)
GET    /auth/me           # 내 프로필 조회 (토큰 검증)
```

### Users (ADMIN 전용)

```
GET    /users                     # 사용자 목록(role/team 필터 + 페이지)
GET    /users/:id                 # 사용자 상세
PATCH  /users/:id/role-team       # 역할/팀 변경 (규칙 자동 정규화)
PATCH  /users/:id/status          # 활성/비활성
```

### Events

```
POST   /events                    # 생성 (PLANNER/ADMIN)
GET    /events                    # 목록 (권한 반영 + 필터 + 페이지)
GET    /events/:id                # 단건 (민감 접근 제어)
PATCH  /events/:id                # 수정 (소유 PLANNER/ADMIN, v 기반 낙관락)
DELETE /events/:id                # 삭제 (소유 PLANNER/ADMIN)
PATCH  /events/:id/reviewers      # 리뷰어 재지정 (소유 PLANNER/ADMIN, 상태 동기화)
```

### Reviews

```
GET    /events/:id/reviews/status           # 리뷰 상태 + 최종 상태 조회
GET    /events/:id/reviews/history          # 전체 히스토리 조회
GET    /events/:id/reviews/:team/history    # 팀별 히스토리 조회
PATCH  /events/:id/reviews/status           # 리뷰 상태 변경 (REVIEWER/ADMIN)
GET    /events/reviews/my                   # 내 리뷰 작업함(팀/상태 필터 + 페이지)
```
---

## 🔄 리뷰 상태머신 & 동시성 제어

### 리뷰 전이

```
PENDING → APPROVED | REJECTED
```

### 최종 상태 자동 계산

```typescript
if (지정된 모든 팀이 APPROVED) {
  finalStatus = "APPROVED"
} else if (하나라도 REJECTED) {
  finalStatus = "REJECTED"
} else {
  finalStatus = "IN_PROGRESS"
}
```

### 낙관적 락 (Optimistic Lock)

- 문서의 버전키 `v`를 기대버전으로 전송하여 `findOneAndUpdate` 수행
- `$set` + `$push` 원자 갱신
- 충돌 시 **409 Conflict** 반환

**예시:**

```bash
PATCH /events/:id
Body: { "title": "Updated", "v": 3 }

# 다른 사용자가 먼저 수정하면 → 409 Conflict
```

---

## 🛡 권한/가시성 규칙

### 조회 시 권한

| 역할 | 조회 가능 범위 |
|------|---------------|
| **VIEWER** | 비민감(`isConfidential=false`)만 조회 |
| **PLANNER** | 본인 담당 + 공개 |
| **REVIEWER** | 본인 배정 + 공개 |
| **ADMIN** | 전체 |

> **민감 이벤트**는 오너/지정 리뷰어/ADMIN만 접근

---

## 🧪 빠른 테스트 가이드

### 1. 로그인

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "planner@nexon.com",
    "password": "123456"
  }'
```

**응답:**

```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

### 2. 이벤트 생성

```bash
curl -X POST http://localhost:3000/events \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "신규 던전 업데이트",
    "description": "레벨 100 던전 추가",
    "startDate": "2025-11-01T00:00:00Z",
    "endDate": "2025-11-30T23:59:59Z",
    "isConfidential": true,
    "devReviewerId": "<USER_ID>",
    "qaReviewerId": "<USER_ID>"
  }'
```

### 3. 리뷰어 배정

```bash
PATCH /events/:id/reviewers
```

### 4. 리뷰 진행

각 리뷰어 계정으로 로그인 후:

```bash
PATCH /events/:id/reviews/status
```

### 5. 최종 상태 확인

```bash
GET /events/:id/reviews/status
```

---
### 공통 유틸

```typescript
normalizeRoleTeamOrThrow(role, team)        // 역할/팀 규칙 정규화
calcFinalStatus(...)                        // 최종 상태 계산
initStatusesByReviewers(...)                // 초기 상태 설정
recalcStatusesOnReviewerChange(...)         // 리뷰어 변경 시 상태 재계산
canReadEvent(user, event)                   // 읽기 권한 체크
canModifyEvent(user, event)                 // 수정 권한 체크
```

---
## 🔒 보안 노트

### 환경변수 관리

> **평가 편의상 `.env` 포함**(프라이빗 레포).  
> 운영 전환 시 제거/Secret Manager 이관 권장.

### 의존성 취약점

**validator URL 취약점 (GHSA-9965-vmph-33xx)**
- 본 프로젝트 경로에서 미사용
- `@IsUrl()` 데코레이터 사용하지 않음
- 실질적 위험도: **낮음**
- Link: https://github.com/advisories/GHSA-9965-vmph-33xx
- 참고: npm audit fix --force는 의존성 트리를 손상시킬 수 있어 사용하지 않았습니다.

### 구현된 보안 기능

- JWT 기반 인증 (Access + Refresh Token)
- bcrypt 비밀번호 해싱
- RBAC 권한 제어
- MongoDB Injection 방지 (Mongoose)
- 입력 검증 (class-validator)
- 민감 정보 보호 (`isConfidential`)

---

## 코딩 컨벤션

- **Airbnb Style Guide** + ESLint + Prettier
- **"파일/클래스 단수, API 경로 복수"** 네이밍 규칙
- 모든 목록 API: **페이지네이션 + 필터** 제공

---

## 시간 제약으로 미구현 / 추후 보완

1. **테스트 코드**
   - E2E/단위 테스트 미작성
   - 핵심 도메인부터 보강 예정

2. **공통 Exception Filter**
   - 에러 스키마 통일
   - 로깅 고도화 여지
   
3. **Swagger 에러 공통 DTO 미정의**
   - 모든 에러 응답 구조 통일 실패
   - Swagger 문서의 오류 응답 일관성 부족

4. **에러 ENUM 미적용**
   - 프로젝트 전체에서 공통 에러 코드 ENUM 적용 미완료

5. **요청 레이트리미터 (Gateway)**
   - 요청 폭주 방지를 위한 rate limiting 미적용

---

**Thanks for reviewing!**
