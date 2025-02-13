//package com.LinkVerse.post.configuration;
//
//import jakarta.servlet.*;
//import jakarta.servlet.http.HttpServletRequest;
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.stereotype.Component;
//
//import java.io.IOException;
//
//@Component
//public class ZoomEventFilter implements Filter {
//
//    @Value("${zoom.client.secret-token}")
//    private String secretToken;
//
//    @Override
//    public void init(FilterConfig filterConfig) throws ServletException {
//        // Initialization code if needed
//    }
//
//    @Override
//    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
//            throws IOException, ServletException {
//        HttpServletRequest httpRequest = (HttpServletRequest) request;
//        String token = httpRequest.getHeader("Authorization");
//
//        if (httpRequest.getMethod().equalsIgnoreCase("POST") && "application/json".equals(httpRequest.getContentType())) {
//            ServletInputStream inputStream = httpRequest.getInputStream();
//            String body = new String(inputStream.readAllBytes());
//            if (body.contains("\"event\":\"endpoint.url_validation\"")) {
//                // Nếu là xác minh URL, trả về plainToken
//                response.setContentType("application/json");
//                response.getWriter().write("{\"plainToken\":\"YOUR_PLAIN_TOKEN\"}");
//                return;
//            }
//        }
//
//        if (secretToken.equals(token)) {
//            chain.doFilter(request, response); // Token hợp lệ, tiếp tục xử lý
//        } else {
//            throw new ServletException("Invalid Zoom event notification token"); // Token không hợp lệ
//        }
//    }
//
//
//    @Override
//    public void destroy() {
//        // Cleanup code if needed
//    }
//}