import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { auth } from '../_actions/user_action';

export default function (SpecificComponent, option, adminRoute = null) {

    /*
        option 

        null : 아무나 가능
        true : 로그인 유저만 가능
        false : 로그인 안한 유저만 가능
    */

    function AuthenticationCheck(props) {
        const dispatch = useDispatch();

        useEffect(() => {
            dispatch(auth()).then(response => {
                console.log(response.data)

                if(!response.payload.isAuth) {
                    if(option) {
                        props.history.push('/login')
                    }    
                } else {
                    if(adminRoute && !response.payload.isAdmin) {
                        props.history.push('/')
                    } else {
                        if(option === false) {
                            props.history.push('/')
                        }
                    }
                }
            })
        })

        return (
            <SpecificComponent/>
        )
    }

    return AuthenticationCheck
}