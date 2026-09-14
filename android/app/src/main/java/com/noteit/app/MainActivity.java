package com.noteit.app;

import android.content.Context;
import android.os.Bundle;
import android.print.PrintAttributes;
import android.print.PrintDocumentAdapter;
import android.print.PrintManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        this.bridge.getWebView().addJavascriptInterface(new WebAppInterface(this), "AndroidPrint");
    }

    public class WebAppInterface {
        Context mContext;

        WebAppInterface(Context c) {
            mContext = c;
        }

        @JavascriptInterface
        public void printDocument(final String jobName) {
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    WebView webView = bridge.getWebView();
                    if (webView != null) {
                        PrintManager printManager = (PrintManager) getSystemService(Context.PRINT_SERVICE);
                        PrintDocumentAdapter printAdapter = webView.createPrintDocumentAdapter(jobName != null ? jobName : "NoteIT_Document");
                        if (printManager != null) {
                            printManager.print(jobName != null ? jobName : "NoteIT_Document", printAdapter, new PrintAttributes.Builder().build());
                        }
                    }
                }
            });
        }
    }
}
