import React, { Component } from 'react'
import Link from 'react-router-dom/Link'

//Mui
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Button from '@material-ui/core/Button';


export class navbar extends Component {
    render() {
        return (
            <AppBar>
                <Toolbar>
                    <Button color='inherit' component={Link} to='/' >Home</Button>
                    <Button color='inherit' component={Link} to='/login'>Login</Button>
                    <Button color='inherit' component={Link} to='/signup'>Signup</Button>
                </Toolbar>
            </AppBar>
        )
    }
}

export default navbar
