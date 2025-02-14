import Abacus from 'mdi-material-ui/Abacus'
import AbjadArabic from 'mdi-material-ui/AbjadArabic'
import AbjadHebrew from 'mdi-material-ui/AbjadHebrew'
import AbTesting from 'mdi-material-ui/AbTesting'
import AbugidaDevanagari from 'mdi-material-ui/AbugidaDevanagari'
import AbugidaThai from 'mdi-material-ui/AbugidaThai'
import AccessPoint from 'mdi-material-ui/AccessPoint'
import AccessPointCheck from 'mdi-material-ui/AccessPointCheck'
import AccessPointMinus from 'mdi-material-ui/AccessPointMinus'
import AccessPointNetwork from 'mdi-material-ui/AccessPointNetwork'
import AccessPointNetworkOff from 'mdi-material-ui/AccessPointNetworkOff'
import AccessPointOff from 'mdi-material-ui/AccessPointOff'
import AccessPointPlus from 'mdi-material-ui/AccessPointPlus'
import AccessPointRemove from 'mdi-material-ui/AccessPointRemove'
import Account from 'mdi-material-ui/Account'
import AccountAlert from 'mdi-material-ui/AccountAlert'
import AccountAlertOutline from 'mdi-material-ui/AccountAlertOutline'
import AccountArrowLeft from 'mdi-material-ui/AccountArrowLeft'
import AccountArrowLeftOutline from 'mdi-material-ui/AccountArrowLeftOutline'
import AccountArrowRight from 'mdi-material-ui/AccountArrowRight'
import AccountArrowRightOutline from 'mdi-material-ui/AccountArrowRightOutline'
import AccountBox from 'mdi-material-ui/AccountBox'
import AccountBoxMultiple from 'mdi-material-ui/AccountBoxMultiple'
import AccountBoxMultipleOutline from 'mdi-material-ui/AccountBoxMultipleOutline'
import AccountBoxOutline from 'mdi-material-ui/AccountBoxOutline'
import AccountCancel from 'mdi-material-ui/AccountCancel'
import AccountCancelOutline from 'mdi-material-ui/AccountCancelOutline'
import AccountCash from 'mdi-material-ui/AccountCash'
import AccountCashOutline from 'mdi-material-ui/AccountCashOutline'
import AccountCheck from 'mdi-material-ui/AccountCheck'
import AccountCheckOutline from 'mdi-material-ui/AccountCheckOutline'
import AccountChild from 'mdi-material-ui/AccountChild'
import AccountChildCircle from 'mdi-material-ui/AccountChildCircle'
import AccountChildOutline from 'mdi-material-ui/AccountChildOutline'
import AccountCircle from 'mdi-material-ui/AccountCircle'
import AccountCircleOutline from 'mdi-material-ui/AccountCircleOutline'
import AccountClock from 'mdi-material-ui/AccountClock'
import AccountClockOutline from 'mdi-material-ui/AccountClockOutline'
import AccountCog from 'mdi-material-ui/AccountCog'
import AccountCogOutline from 'mdi-material-ui/AccountCogOutline'
import AccountConvert from 'mdi-material-ui/AccountConvert'
import AccountConvertOutline from 'mdi-material-ui/AccountConvertOutline'
import AccountCowboyHat from 'mdi-material-ui/AccountCowboyHat'
import AccountDetails from 'mdi-material-ui/AccountDetails'
import AccountDetailsOutline from 'mdi-material-ui/AccountDetailsOutline'
import AccountEdit from 'mdi-material-ui/AccountEdit'
import AccountEditOutline from 'mdi-material-ui/AccountEditOutline'
import AccountGroup from 'mdi-material-ui/AccountGroup'
import AccountOutline from 'mdi-material-ui/AccountOutline'
import CellphoneLink from 'mdi-material-ui/CellphoneLink'
import CurrencyUsd from 'mdi-material-ui/CurrencyUsd'
import DotsVertical from 'mdi-material-ui/DotsVertical'
import TrendingUp from 'mdi-material-ui/TrendingUp'

import { ChaarvyIcon } from './enums'

const icons = {
  Abacus,
  Account,
  AbTesting,
  AccountBox,
  AccountCog,
  AbjadArabic,
  AbjadHebrew,
  AbugidaThai,
  AccessPoint,
  AccountCash,
  AccountEdit,
  AccountAlert,
  AccountCheck,
  AccountChild,
  AccountClock,
  AccountGroup,
  AccountCancel,
  AccountCircle,
  AccessPointOff,
  AccountConvert,
  AccountDetails,
  AccessPointPlus,
  AccessPointCheck,
  AccessPointMinus,
  AccountArrowLeft,
  AccountCowboyHat,
  AbugidaDevanagari,
  AccessPointRemove,
  AccountArrowRight,
  AccountBoxOutline,
  AccountCogOutline,
  AccessPointNetwork,
  AccountBoxMultiple,
  AccountCashOutline,
  AccountChildCircle,
  AccountEditOutline,
  AccountAlertOutline,
  AccountCheckOutline,
  AccountChildOutline,
  AccountClockOutline,
  AccountCancelOutline,
  AccountCircleOutline,
  AccessPointNetworkOff,
  AccountConvertOutline,
  AccountDetailsOutline,
  AccountArrowLeftOutline,
  AccountArrowRightOutline,
  AccountBoxMultipleOutline,
  TrendingUp,
  CurrencyUsd,
  DotsVertical,
  CellphoneLink,
  AccountOutline
}

interface GetChaarvyIconsProps {
  iconName: ChaarvyIcon
  fontSize?: string
}

const GetChaarvyIcons = ({ iconName, fontSize }: GetChaarvyIconsProps) => {
  const IconTag = icons[iconName as keyof typeof icons]

  return <IconTag sx={{ fontSize: fontSize ?? '1.75rem' }} />
}

export default GetChaarvyIcons
