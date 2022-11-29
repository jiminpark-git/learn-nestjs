# 1. [NestJS] NestJS 배우기

## NestJS를 배우는 이유

### NestJS를 알게 된 계기

노마드 코더의 유튜브에서 [백엔드 개발자는 꼭 배워보세요](https://youtu.be/SHfR1tLpe1o)라는 영상을 시청한 뒤 체계화가 잘 되어 있는 NestJS 프레임워크에 반했다.

### NestJS로 API 만들기 by 노마드 코더

이후 노마드 코더가 강의하는 무료 강의 [NestJS로 API 만들기](https://nomadcoders.co/nestjs-fundamentals)를 수강하였다.

### NestJS를 더 알고 싶다

노마드 코더의 NestJS 강의를 수강 후, NestJS 프레임워크를 더 깊이 공부하기로 했다.

---

## NestJS 프로젝트 세팅

```bash
$ npm i -g @nestjs/cli
$ nest new learn-nestjs
> yarn
```

이번 시리즈에서는 패키지 관리자로 yarn을 사용하여 공부한다.

```bash
$ cd learn-nestjs
$ nest start --watch
```

--watch : src 폴더에서 변화가 발생할 경우 자동으로 다시 컴파일
