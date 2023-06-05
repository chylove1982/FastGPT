import React, { useState, Dispatch, useCallback } from 'react';
import { FormControl, Flex, Input, Button, FormErrorMessage, Box } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { PageTypeEnum } from '@/constants/user';
import { postLogin, postRegister } from '@/api/user';
import type { ResLogin } from '@/api/response/user';
import { useToast } from '@/hooks/useToast';
import { useRouter } from 'next/router';
import axios from 'axios';

interface Props {
  setPageType: Dispatch<`${PageTypeEnum}`>;
  loginSuccess: (e: ResLogin) => void;
}

interface LoginFormType {
  username: string;
  password: string;
}

/* 1 */
let hctUser = {
  username: '',
  password: '',
  type: 1
}
const regist = async (loginType = '', loginCode = '', { setPageType, loginSuccess }: Props) => {
  console.log(loginType, loginCode)
  const lafResponse = await axios.get(
    'https://1039-test-api.hct1039.com/system/user/getInfo',
    {
      headers: {
        Authorization: loginCode
      },
      timeout: 60000,
      responseType: 'json'
    }
  );
  let hctUserName = lafResponse?.data?.user?.userName || ''
  if (hctUserName) {
    hctUser.username = hctUserName;
    hctUser.password = '123456';
    try {
      await postRegister({
        username: hctUser.username,
        code: '969987569',
        password: hctUser.password,
        inviterId: localStorage.getItem('inviterId') || ''
      })
    } catch (e) {
      const { code = 0 } = e as { code: number };
      const { message = '' } = e as { message: string };
      if (code === 500 && message === '该用户已被注册') {
        console.log('该用户已被注册,开始尝试增加使用账号密码登录！')
      } else {
        hctUser.type = 0
        return
      }
    }
  } else {
    hctUser.type = 0
    return
  }
}
/* 1 */

const LoginForm = ({ setPageType, loginSuccess }: Props) => {

  /* 1 */
  const router = useRouter();
  const { loginType = '' } = router.query as { loginType: string };
  const { loginCode = '' } = router.query as { loginCode: string };
  if (loginCode) {
    if (loginType === '1') {
      regist(loginType, loginCode, { setPageType, loginSuccess });
    }
  }
  /* 1 */


  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormType>();

  const [requesting, setRequesting] = useState(false);

  /* 1 */
  if (loginCode) {
    if (loginType === '1') {
      const onHctLogin = useCallback(
        async ({ username, password }: LoginFormType) => {
          if (hctUser.type == 0) {
            toast({
              title: '登录异常,请尝试手动登录或联系系统客服！',
              status: 'error'
            });
            window.location.href = 'http://localhost:3000/login'
            return
          }
          setRequesting(true);
          try {
            loginSuccess(
              await postLogin({
                username: hctUser.username,
                password: hctUser.password
              })
            );
            toast({
              title: '登录成功',
              status: 'success'
            });
          } catch (error: any) {
            toast({
              title: error.message || '登录异常',
              status: 'error'
            });
          }
          setRequesting(false);
        },
        [loginSuccess, toast]
      );
      setTimeout(()=>{
        handleSubmit(onHctLogin)
      },100)
      return (
        <>
          <Box fontWeight={'bold'} fontSize={'2xl'} textAlign={'center'}>
            登录 MagicTool
          </Box>
          <form onSubmit={handleSubmit(onHctLogin)}>
            <Button
              type="submit"
              mt={8}
              w={'100%'}
              size={['md', 'lg']}
              colorScheme="blue"
              isLoading={requesting}
            >
              1039会员授权登录
            </Button>
          </form>
        </>
      );
    }
  }
  /* 1 */

  const onclickLogin = useCallback(
    async ({ username, password }: LoginFormType) => {
      setRequesting(true);
      try {
        loginSuccess(
          await postLogin({
            username,
            password
          })
        );
        toast({
          title: '登录成功',
          status: 'success'
        });
      } catch (error: any) {
        toast({
          title: error.message || '登录异常',
          status: 'error'
        });
      }
      setRequesting(false);
    },
    [loginSuccess, toast]
  );
  // return (
  //   <>
  //     <Box mt={100} fontWeight={'bold'} fontSize={'2xl'} textAlign={'center'}>
  //       登录流程异常！
  //     </Box>
  //     <Box fontWeight={'bold'} fontSize={'2xl'} textAlign={'center'}>
  //       请重新由1039系统登录或联系管理员！
  //     </Box>
  //   </>
  // );

  return (
    <>
      <Box fontWeight={'bold'} fontSize={'2xl'} textAlign={'center'}>
        登录 MagicTool
      </Box>
      <form onSubmit={handleSubmit(onclickLogin)}>
        <FormControl mt={8} isInvalid={!!errors.username}>
          <Input
            placeholder="邮箱/手机号"
            size={['md', 'lg']}
            {...register('username', {
              required: '邮箱/手机号不能为空',
              pattern: {
                value:
                  /(^1[3456789]\d{9}$)|(^[A-Za-z0-9]+([_\.][A-Za-z0-9]+)*@([A-Za-z0-9\-]+\.)+[A-Za-z]{2,6}$)/,
                message: '邮箱/手机号格式错误'
              }
            })}
          ></Input>
          <FormErrorMessage position={'absolute'} fontSize="xs">
            {!!errors.username && errors.username.message}
          </FormErrorMessage>
        </FormControl>
        <FormControl mt={8} isInvalid={!!errors.password}>
          <Input
            type={'password'}
            size={['md', 'lg']}
            placeholder="密码"
            {...register('password', {
              required: '密码不能为空',
              minLength: {
                value: 4,
                message: '密码最少4位最多12位'
              },
              maxLength: {
                value: 12,
                message: '密码最少4位最多12位'
              }
            })}
          ></Input>
          <FormErrorMessage position={'absolute'} fontSize="xs">
            {!!errors.password && errors.password.message}
          </FormErrorMessage>
        </FormControl>
        <Flex align={'center'} justifyContent={'space-between'} mt={6} color={'myBlue.600'}>
          <Box
            cursor={'pointer'}
            _hover={{ textDecoration: 'underline' }}
            onClick={() => setPageType('forgetPassword')}
            fontSize="sm"
          >
            忘记密码?
          </Box>
          <Box
            cursor={'pointer'}
            _hover={{ textDecoration: 'underline' }}
            onClick={() => setPageType('register')}
            fontSize="sm"
          >
            注册账号
          </Box>
        </Flex>
        <Button
          type="submit"
          mt={8}
          w={'100%'}
          size={['md', 'lg']}
          colorScheme="blue"
          isLoading={requesting}
        >
          登录
        </Button>
      </form>
    </>
  );
};

export default LoginForm;
