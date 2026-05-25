use ReCaptcha\ReCaptcha;
use ReCaptcha\RequestMethod\CurlPost;

class FormController extends Controller
{
    public function handleForm(Request $request)
    {
        $secretKey = config('services.recaptcha.secret_key');
        $gRecaptchaResponse = $request->input('g-recaptcha-response');
        $remoteIp = $request->ip();

        $recaptcha = new ReCaptcha($secretKey);
        $resp = $recaptcha->setExpectedHostname('your-domain.com') 
                           ->verify($gRecaptchaResponse, $remoteIp);

        if ($resp->isSuccess()) {

            return "Verification success";
        } else {
            $errors = $resp->getErrorCodes();
            return back()->withErrors(['recaptcha' => 'reCAPTCHA verification failed.']);
        }
    }
}